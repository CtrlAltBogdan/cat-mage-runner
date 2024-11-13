package runner.shahovyi;

import androidx.appcompat.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

public class WebViewActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_view);

        WebView webView = findViewById(R.id.webview);

        // Настройки WebView
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);          // Включаем поддержку JavaScript
        webSettings.setDomStorageEnabled(true);          // Включаем поддержку локального хранилища
        webSettings.setAllowFileAccess(true);            // Разрешаем доступ к локальным файлам

        // Настройка клиента для обработки кликов и URL
        webView.setWebViewClient(new WebViewClient());

        // Подключение JavaScript-интерфейса
        webView.addJavascriptInterface(new JavaScriptObject(this), "Bridging");

        // Загрузка локального файла index.html из assets
        webView.loadUrl("file:///android_asset/index.html");
    }
}
