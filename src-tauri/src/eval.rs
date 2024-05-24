use std::io::{Write, BufReader, BufRead};
use std::os::windows::process::CommandExt;
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

        let mut cmd = Command::new(python);

        #[cfg(target_os = "windows")]
        {
            const CREATE_NO_WINDOW: u32 = 0x08000000;
            cmd.creation_flags(CREATE_NO_WINDOW);
        }
       
        let child = cmd
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
        let mut result = Vec::new();
        self.stdout.read_until(b'\n',&mut result).unwrap();
        let mut parsed_result = String::from_utf8_lossy(&result).to_string();
        parsed_result.pop(); // exclude newline
        return parsed_result;
    }
}

#[tauri::command(async)]
pub fn evaluate(pool: tauri::State<Mutex<Pool<Evaluator>>>, task: String) -> String {
    let (tx, rx) = channel();

    let pool_clone = pool.lock().unwrap();
    pool_clone.execute_to(tx.clone(), task.to_owned());

    let output = rx.recv().unwrap_or_else(|error| error.to_string());

    output
}