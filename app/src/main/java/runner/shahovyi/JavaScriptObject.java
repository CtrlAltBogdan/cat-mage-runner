package runner.shahovyi;

import android.content.Context;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

public class JavaScriptObject {
    private Context context;

    public JavaScriptObject(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public void showToast() {
        Toast toast = Toast.makeText(context, "(・∀・)b", Toast.LENGTH_LONG);
        toast.show();
    }
}
