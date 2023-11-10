use std::io::{Write, BufReader, BufRead};
use std::process::{Command, Stdio};

#[tauri::command]
pub fn evaluate(app_handle: tauri::AppHandle, input: Vec<(&str, f64)>) -> String {
    
    let python = app_handle.path_resolver()
        .resolve_resource("../python/venv/Scripts/python.exe")
        .unwrap();

    let script = app_handle.path_resolver()
        .resolve_resource("../python/evaluator.py")
        .unwrap();

    let mut child = Command::new(python.as_os_str())
        .arg(script.as_os_str())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .spawn()
        .expect("Failed to start command");

    let stdin = child.stdin.as_mut().expect("Failed to open stdin");
    let stdout = child.stdout.as_mut().expect("Failed to open stdout");

    let mut reader = BufReader::new(stdout);

    for i in 0..5 {
        let input = format!("sin(x), {{\"x\": {i}}}\n");
        stdin.write_all(input.as_bytes()).expect("Failed to write to stdin");
        let mut result = String::new();
        reader.read_line(&mut result).expect("Failed to read from stdout");
        println!("{result}")
    }

    return "temp".to_string();
}