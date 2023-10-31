// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Menu, Submenu};

fn create_menu() -> Menu {
    return Menu::new()
        .add_submenu(Submenu::new("File",Menu::new()
            .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
            )
        )
        .add_submenu(Submenu::new("Edit", Menu::new()
            .add_item(CustomMenuItem::new("insert".to_string(), "Insert"))
            .add_item(CustomMenuItem::new("delete".to_string(), "Delete"))
            )  
        )
}

fn main() {
    let menu = create_menu();
    tauri::Builder::default()
        .menu(menu)
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
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
