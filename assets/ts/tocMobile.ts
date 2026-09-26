/**
 * 移动端目录卡片（<details>）的展开/收起动画。
 * <details> 收起时会立刻 display:none 内容，CSS 无法做收起过渡，
 * 所以接管 summary 点击：用 Web Animations 过渡卡片高度，结束后再切 open。
 */
export function setupTocMobile(): void {
    const details = document.querySelector('details.toc-mobile-card') as HTMLDetailsElement | null;
    if (!details) return;
    const summary = details.querySelector('summary') as HTMLElement | null;
    if (!summary) return;

    const DURATION_MS = 260;
    const EASING = 'ease';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let running: Animation | null = null;

    const finish = () => {
        details.style.removeProperty('overflow');
        details.classList.remove('is-opening', 'is-closing');
        running = null;
    };

    summary.addEventListener('click', (event: MouseEvent) => {
        event.preventDefault();
        if (reduceMotion) {
            details.open = !details.open;
            return;
        }

        if (running) running.cancel();
        details.style.overflow = 'hidden';
        const from = details.offsetHeight;

        if (details.open) {
            // 收起：先动画到只剩 summary 的高度，再真正关闭
            details.classList.remove('is-opening');
            details.classList.add('is-closing');
            running = details.animate(
                { height: [`${from}px`, `${summary.offsetHeight}px`] },
                { duration: DURATION_MS, easing: EASING },
            );
            running.onfinish = () => {
                details.open = false;
                finish();
            };
            running.oncancel = finish;
        } else {
            // 展开：先打开取得目标高度，再从 summary 高度动画过去
            details.classList.remove('is-closing');
            details.classList.add('is-opening');
            details.open = true;
            const to = details.offsetHeight;
            running = details.animate(
                { height: [`${from}px`, `${to}px`] },
                { duration: DURATION_MS, easing: EASING },
            );
            running.onfinish = finish;
            running.oncancel = finish;
        }
    });
}
