// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use evaluation::Evaluator;
use rustysynth::{SoundFont, SynthesizerSettings, Synthesizer};
use tauri::{CustomMenuItem, Menu, Submenu, Manager};
use workerpool::Pool;
use std::{env, sync::{Mutex, Arc}, fs::File};
use tinyaudio::prelude::*;
use itertools::Itertools;

mod evaluation;

fn create_menu() -> Menu {
    return Menu::new()
        .add_submenu(Submenu::new("File",Menu::new()
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
            )
        )
        .add_submenu(Submenu::new("Selection", Menu::new()
            .add_item(CustomMenuItem::new("insert".to_string(), "Insert Empty Item(s)").accelerator("CmdOrCtrl+I"))
            .add_item(CustomMenuItem::new("delete".to_string(), "Delete").accelerator("Delete"))
            )  
        )
}

#[tauri::command(async)]
fn play_note(synthesizer: tauri::State<Arc<Mutex<Synthesizer>>>, channel: i32, key: i32, velocity: i32, duration: f32) {
    let synth_clone = synthesizer.clone();

    synth_clone.lock().unwrap().note_on(channel, key, velocity);

    std::thread::sleep(std::time::Duration::from_secs_f32(duration));

    synth_clone.lock().unwrap().note_off(channel, key);
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            env::set_var("PYTHON_PATH", app.path_resolver()
                .resolve_resource("res/python/venv/Scripts/python.exe")
                .expect("Failed to resolve resource")
            );

            env::set_var("SCRIPT_PATH", app.path_resolver()
                .resolve_resource("res/python/evaluator.py")
                .expect("Failed to resolve resource")
            );

            let pool = Pool::<Evaluator>::new(4);

            app.manage(Mutex::new(pool));

            // Setup the audio output.
            let params = OutputDeviceParameters {
                channels_count: 2,
                sample_rate: 44100,
                channel_sample_count: 4410,
            };

            // Buffer for the audio output.
            let mut left: Vec<f32> = vec![0_f32; params.channel_sample_count];
            let mut right: Vec<f32> = vec![0_f32; params.channel_sample_count];

            // Load the SoundFont.
            let soundfont_path = app.path_resolver()
                .resolve_resource("res/GeneralUser GS v1.471.sf2")
                .expect("Failed to resolve resource");
            let mut soundfont_file = File::open(soundfont_path).unwrap();
            let soundfont = Arc::new(SoundFont::new(&mut soundfont_file).unwrap());
            
            // Create the MIDI file sequencer.
            let settings = SynthesizerSettings::new(params.sample_rate as i32);
            let synthesizer = Arc::new(
                Mutex::new(Synthesizer::new(&soundfont, &settings).unwrap())
            );

            let synth_clone = synthesizer.clone();

            let audio_output_device = run_output_device(params, {
                move |data| {
                    synth_clone.lock().unwrap().render(&mut left[..], &mut right[..]);
                    for (i, value) in left.iter().interleave(right.iter()).enumerate() {
                        data[i] = *value;
                    }
                }
            })
            .unwrap();

            app.manage(Mutex::new(audio_output_device));

            app.manage(synthesizer);

            Ok(())
        })
        .menu(create_menu())
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                }
                "insert" => {
                    event.window().emit("insert", {}).unwrap();
                }
                "delete" => {
                    event.window().emit("delete", {}).unwrap();
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![evaluation::evaluate, play_note])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
