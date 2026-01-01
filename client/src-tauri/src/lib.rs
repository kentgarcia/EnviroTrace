use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            let handle = app.handle().clone();

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
