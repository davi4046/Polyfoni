// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use midi_player::MidiPlayer;
use oxisynth::MidiEvent;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, Manager};
use workerpool::Pool;
use std::{env, sync::Mutex};

mod eval;
mod midi_player;

fn create_menu() -> Menu {
    return Menu::new()
        .add_submenu(Submenu::new("File",Menu::new()
            .add_item(CustomMenuItem::new("save_as".to_string(), "Save as"))
            .add_item(CustomMenuItem::new("save".to_string(), "Save"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("export_to_midi".to_string(), "Export to MIDI"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
            )
        )
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

            let pool = Pool::<eval::Evaluator>::new(4);

            app.manage(Mutex::new(pool));

            let midi_player = MidiPlayer::new();

            app.manage(Mutex::new(midi_player));

            Ok(())
        })
        .menu(create_menu())
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "save_as" => {
                    event.window().emit("save_as", {}).unwrap();
                }
                "save" => {
                    event.window().emit("save", {}).unwrap();
                }
                "export_to_midi" => {
                    event.window().emit("export_to_midi", {}).unwrap();
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![
            eval::evaluate, 
            midi_note_on, 
            midi_note_off, 
            midi_program_change,
            midi_control_change
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Commands

#[tauri::command(async)]
fn midi_note_on(midi_player: tauri::State<Mutex<MidiPlayer>>, channel: u8, key: u8, vel: u8) {
    let midi_player_locked = midi_player.lock().unwrap();
    midi_player_locked.sender.send(MidiEvent::NoteOn { channel, key, vel }).ok();
}

#[tauri::command(async)]
fn midi_note_off(midi_player: tauri::State<Mutex<MidiPlayer>>, channel: u8, key: u8) {
    let midi_player_locked = midi_player.lock().unwrap();
    midi_player_locked.sender.send(MidiEvent::NoteOff { channel, key }).ok();
}

#[tauri::command(async)]
fn midi_program_change(midi_player: tauri::State<Mutex<MidiPlayer>>, channel: u8, program_id: u8) {
    let midi_player_locked = midi_player.lock().unwrap();
    midi_player_locked.sender.send(MidiEvent::ProgramChange { channel, program_id }).ok();
}

#[tauri::command(async)]
fn midi_control_change(midi_player: tauri::State<Mutex<MidiPlayer>>, channel: u8, control: u8, value: u8) {
    let midi_player_locked = midi_player.lock().unwrap();
    midi_player_locked.sender.send(MidiEvent::ControlChange { channel, ctrl: control, value }).ok();
}
