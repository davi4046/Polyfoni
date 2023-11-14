// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use evaluation::Evaluator;
use tauri::{CustomMenuItem, Menu, Submenu, Manager};
use workerpool::Pool;
use std::{env, sync::Mutex};

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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            env::set_var("PYTHON_PATH", app.path_resolver()
                .resolve_resource("../python/venv/Scripts/python.exe")
                .expect("Failed to resolve resource")
            );

            env::set_var("SCRIPT_PATH", app.path_resolver()
                .resolve_resource("../python/evaluator.py")
                .expect("Failed to resolve resource")
            );

            let pool = Pool::<Evaluator>::new(4);

            app.manage(Mutex::new(pool));

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
        .invoke_handler(tauri::generate_handler![evaluation::evaluate])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
