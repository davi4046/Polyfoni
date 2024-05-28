// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use midi_player::MidiPlayer;
use oxisynth::MidiEvent;
use tauri::{api::shell::open, CustomMenuItem, Manager, Menu, MenuItem, Submenu};
use workerpool::Pool;
use std::{env, sync::Mutex};

mod eval;
mod midi_player;

fn create_menu() -> Menu {
    return Menu::new()
        .add_submenu(Submenu::new("File",Menu::new()
            .add_item(CustomMenuItem::new("new_file".to_string(), "New File"))
            .add_item(CustomMenuItem::new("open_file".to_string(), "Open File..."))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("save_as".to_string(), "Save As..."))
            .add_item(CustomMenuItem::new("save".to_string(), "Save"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("export_to_midi".to_string(), "Export to MIDI..."))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
            )
        )
        .add_submenu(Submenu::new("Edit", Menu::new()
            .add_item(CustomMenuItem::new("create_items".to_string(), "Create Item(s)").accelerator("F12"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("cut_items".to_string(), "Cut").accelerator("CmdOrCtrl+X"))
            .add_item(CustomMenuItem::new("copy_items".to_string(), "Copy").accelerator("CmdOrCtrl+C"))
            .add_item(CustomMenuItem::new("paste_items".to_string(), "Paste").accelerator("CmdOrCtrl+V"))
            .add_native_item(MenuItem::Separator)
            .add_item(CustomMenuItem::new("undo_action".to_string(), "Undo").accelerator("CmdOrCtrl+Z"))
            .add_item(CustomMenuItem::new("redo_action".to_string(), "Redo").accelerator("CmdOrCtrl+Shift+Z"))
            )
        )
        .add_submenu(Submenu::new("Help", Menu::new()
            .add_item(CustomMenuItem::new("website".to_string(), "Website"))
            .add_item(CustomMenuItem::new("discord_server".to_string(), "Discord Server"))
            .add_item(CustomMenuItem::new("user_manual".to_string(), "User-Manual"))
            )
        )
        .add_item(CustomMenuItem::new("donation".to_string(), "Donation"))
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {

            let evaluator_path = if cfg!(target_os = "windows") {
                "res/evaluator.exe"
            } else {
                "res/evaluator"
            };

            env::set_var("EVALUATOR_PATH", app.path_resolver()
                .resolve_resource(evaluator_path)
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
                // File
                "new_file" => {
                    let _ = event.window().emit("new-file", {});
                }
                "open_file" => {
                    let _ = event.window().emit("open-file", {});
                }
                "save_as" => {
                    let _ = event.window().emit("save-as", {});
                }
                "save" => {
                    let _ = event.window().emit("save", {});
                }
                "export_to_midi" => {
                    let _ = event.window().emit("export-to-midi", {});
                }
                "quit" => {
                    std::process::exit(0);
                }
                // Edit
                "create_items" => {
                    let _ = event.window().emit("create-items", {});
                }
                "cut_items" => {
                    let _ = event.window().emit("cut-items", {});
                }
                "copy_items" => {
                    let _ = event.window().emit("copy-items", {});
                }
                "paste_items" => {
                    let _ = event.window().emit("paste-items", {});
                }
                "undo_action" => {
                    let _ = event.window().emit("undo-action", {});
                }
                "redo_action" => {
                    let _ = event.window().emit("redo-action", {});
                }
                // Help
                "website" => {
                    let _ = open(&event.window().shell_scope(), "https://polyfoni-app.com", None);
                }
                "discord_server" => {
                    let _ = open(&event.window().shell_scope(), "https://polyfoni-app.com/discord-server", None);
                }
                "user_manual" => {
                    let _ = open(&event.window().shell_scope(), "https://polyfoni-app.com/user-manual", None);
                }
                // Other
                "donation" => {
                    let _ = open(&event.window().shell_scope(), "https://polyfoni-app.com/donation", None);
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
