window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

document.addEventListener('click', hookClick, { capture: true })
// ================= 追加：修复安全区域黑边 (仅为黑色背景) =================
const fixSafeAreaStyle = document.createElement('style');
fixSafeAreaStyle.textContent = `
    body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: env(safe-area-inset-top);
        background-color: #000000;
        z-index: 99999;
        pointer-events: none; /* 关键：防止这块黑色区域阻挡用户正常点击 */
    }
    body::after {
        content: '';
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: env(safe-area-inset-bottom);
        background-color: #000000;
        z-index: 99999;
        pointer-events: none; /* 关键：防止底部黑条挡住按钮点击 */
    }
`;
document.head.appendChild(fixSafeAreaStyle);
// ================= 启动图控制脚本：等待网页加载或超时后关闭 =================
(function() {
    let isClosed = false; // 防止重复关闭的标记

    // 关闭启动图的函数
    function closeSplash() {
        if (isClosed) return;
        isClosed = true;
        // 调用 Tauri 的关闭启动图指令
        if (window.__TAURI__ && window.__TAURI__.invoke) {
            window.__TAURI__.invoke('close_splashscreen')
                .then(() => console.log('Splashscreen closed via invoke'))
                .catch(err => console.error('Failed to close splashscreen:', err));
        }
    }

    // 1. 设置15秒超时兜底（防卡死）
    const timeoutId = setTimeout(() => {
        console.log('Splashscreen timeout (15s) triggered.');
        closeSplash();
    }, 15000);

    // 2. 监听网页加载完成事件（最快路径）
    window.addEventListener('load', () => {
        console.log('Window load event fired.');
        clearTimeout(timeoutId); // 加载成功，取消超时
        closeSplash();
    }, { once: true }); // 只执行一次

    // 3. 兜底：如果 'load' 事件因某些原因未触发，但 DOM 已就绪，也可提前关闭
    if (document.readyState === 'complete') {
        clearTimeout(timeoutId);
        closeSplash();
    }
})();