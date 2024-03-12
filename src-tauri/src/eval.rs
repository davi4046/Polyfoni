use std::io::{Write, BufReader, BufRead};
use std::process::{Command, Stdio, ChildStdin, ChildStdout};
use std::env;
use std::sync::Mutex;
use std::sync::mpsc::channel;

use workerpool::{Worker, Pool};

pub struct Evaluator {
    stdin: ChildStdin,
    stdout: BufReader<ChildStdout>,
}

impl Default for Evaluator {
    fn default() -> Self {
        let python = env::var("PYTHON_PATH").expect("PYTHON_PATH not found");
        let script = env::var("SCRIPT_PATH").expect("SCRIPT_PATH not found");

        let child = Command::new(python)
            .arg(script)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()
            .expect("Failed to start command");
        
        Self {
            stdin: child.stdin.expect("Failed to open stdin"),
            stdout: BufReader::new(child.stdout.expect("Failed to open stdout")),
        }
    }
}

impl Worker for Evaluator {
    type Input = String;
    type Output = String;

    fn execute(&mut self, input: Self::Input) -> Self::Output {
        self.stdin.write_all(input.as_bytes()).unwrap();
        self.stdin.write_all(b"\n").unwrap();
        self.stdin.flush().unwrap();
        let mut result = String::new();
        self.stdout.read_line(&mut result).unwrap();
        result.pop(); // exclude newline
        return result;
    }
}

#[tauri::command(async)]
pub fn evaluate(pool: tauri::State<Mutex<Pool<Evaluator>>>, tasks: Vec<&str>) -> Vec<String> {
    let (tx, rx) = channel();

    let pool_clone = pool.lock().unwrap();

    for task in tasks.clone() {
        pool_clone.execute_to(tx.clone(), task.to_owned());
    }

    let output = rx.iter()
        .take(tasks.len() as usize)
        .collect();

    return output;
}