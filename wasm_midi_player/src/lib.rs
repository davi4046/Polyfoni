use wasm_bindgen::prelude::*;
use web_sys::console;

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::Stream;
use oxisynth::MidiEvent;
use std::sync::mpsc::{Receiver, Sender};

// This is like the `main` function, except for JavaScript.
#[wasm_bindgen(start)]
pub fn main_js() -> Result<(), JsValue> {
    // This provides better error messages in debug mode.
    // It's disabled in release mode so it doesn't bloat up the file size.
    #[cfg(debug_assertions)]
    console_error_panic_hook::set_once();

    Ok(())
}

#[wasm_bindgen]
pub struct MidiPlayer(Stream, Sender<MidiEvent>);

#[wasm_bindgen]
impl MidiPlayer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> MidiPlayer {
        let host = cpal::default_host();
        let device = host
            .default_output_device()
            .expect("failed to find a default output device");
        let config = device.default_output_config().unwrap();

        let (tx, rx) = std::sync::mpsc::channel::<MidiEvent>();

        MidiPlayer(
            match config.sample_format() {
                cpal::SampleFormat::F32 => create_synth_stream::<f32>(&device, &config.into(), rx),
                cpal::SampleFormat::I16 => create_synth_stream::<i16>(&device, &config.into(), rx),
                cpal::SampleFormat::U16 => create_synth_stream::<u16>(&device, &config.into(), rx),
                _ => panic!("Unsupported sample format")
            },
            tx,
        )
    }
    pub fn noteOn(&mut self, channel: u8, key: u8, vel: u8) {
        self.1.send(MidiEvent::NoteOn { channel, key, vel }).ok();
    }
    pub fn noteOff(&mut self, channel: u8, key: u8) {
        self.1.send(MidiEvent::NoteOff { channel, key }).ok();
    }
    pub fn setProgram(&mut self, channel: u8, program: u8) {
        self.1.send(MidiEvent::ProgramChange { channel, program_id: program }).ok();
    }
    pub fn setVolume(&mut self, channel: u8, volume: u8) {
        self.1.send(MidiEvent::ControlChange { channel, ctrl: 7, value: volume }).ok();
    }
    pub fn allNotesOff(&mut self, channel: u8) {
        self.1.send(MidiEvent::AllNotesOff { channel }).ok();
    }
    pub fn allSoundOff(&mut self, channel: u8) {
        self.1.send(MidiEvent::AllSoundOff { channel }).ok();
    }
}

fn create_synth_stream<T>(device: &cpal::Device, config: &cpal::StreamConfig, rx: Receiver<MidiEvent>) -> Stream
where
    T: cpal::SizedSample + cpal::FromSample<f32>,
{
    let sample_rate = config.sample_rate.0 as f32;
    let channels = config.channels as usize;

    let mut synth = {
        let settings = oxisynth::SynthDescriptor {
            sample_rate,
            gain: 1.0,
            ..Default::default()
        };

        let mut synth = oxisynth::Synth::new(settings).unwrap();

        // Load from memory
        use std::io::Cursor;
        let mut file = Cursor::new(include_bytes!("./res/GeneralUser GS v1.471.sf2"));
        let font = oxisynth::SoundFont::load(&mut file).unwrap();

        synth.add_font(font, true);
        synth.set_sample_rate(sample_rate);
        synth.set_gain(1.0);

        synth
    };

    let mut next_value = move || {
        let (l, r) = synth.read_next();

        if let Ok(e) = rx.try_recv() {
            synth.send_event(e).ok();
        }

        (l, r)
    };

    let err_fn = |err| console::error_1(&format!("an error occurred on stream: {}", err).into());

    let stream = device
        .build_output_stream(
            config,
            move |data: &mut [T], _| write_data(data, channels, &mut next_value),
            err_fn,
            None
        )
        .unwrap();
    stream.play().unwrap();
    stream
}

fn write_data<T>(output: &mut [T], channels: usize, next_sample: &mut dyn FnMut() -> (f32, f32))
where
    T: cpal::SizedSample + cpal::FromSample<f32>,
{
    for frame in output.chunks_mut(channels) {
        let (l, r) = next_sample();

        let l: T = cpal::Sample::from_sample(l);
        let r: T = cpal::Sample::from_sample(r);

        let channels = [l, r];

        for (id, sample) in frame.iter_mut().enumerate() {
            *sample = channels[id % 2];
        }
    }
}