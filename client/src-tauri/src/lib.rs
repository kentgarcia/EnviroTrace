use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

// Command to open DevTools
#[tauri::command]
fn open_devtools(app: tauri::AppHandle) {
    #[cfg(debug_assertions)]
    {
        if let Some(window) = app.get_webview_window("main") {
            let _ = window.open_devtools();
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![open_devtools])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let handle = app.handle().clone();

            // Register global shortcuts
            let shortcut_handle = handle.clone();
            app.global_shortcut().on_shortcut("CmdOrCtrl+R", move |_app, _shortcut, _event| {
                let _ = shortcut_handle.emit("shortcut-refresh", ());
            })?;

            let shortcut_handle = handle.clone();
            app.global_shortcut().on_shortcut("F5", move |_app, _shortcut, _event| {
                let _ = shortcut_handle.emit("shortcut-refresh", ());
            })?;

            let shortcut_handle = handle.clone();
            app.global_shortcut().on_shortcut("CmdOrCtrl+Shift+R", move |_app, _shortcut, _event| {
                let _ = shortcut_handle.emit("shortcut-refresh", ());
            })?;

            // Register the shortcuts
            let _ = app.global_shortcut().register("CmdOrCtrl+R");
            let _ = app.global_shortcut().register("F5");
            let _ = app.global_shortcut().register("CmdOrCtrl+Shift+R");

            // Create splash screen window
            let splash_window = tauri::WebviewWindowBuilder::new(
                app,
                "splashscreen",
                tauri::WebviewUrl::App("splash.html".into())
            )
            .title("EnviroTrace")
            .inner_size(800.0, 600.0)
            .decorations(false)
            .always_on_top(true)
            .center()
            .build()?;

            // Close splash screen and show main window after main window is loaded
            tauri::async_runtime::spawn(async move {
                // Wait for the main window to load
                std::thread::sleep(std::time::Duration::from_secs(2));
                
                // Close splash screen
                splash_window.close().unwrap();
                
                // Show main window
                if let Some(main_window) = handle.get_webview_window("main") {
                    main_window.show().unwrap();
                }
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
