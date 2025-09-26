/**
 * Right sidebar ToC lock/auto-hide behavior
 */
export function setupTocToggle(): void {
    const rightSidebar = document.querySelector('.right-sidebar') as HTMLElement | null;
    if (!rightSidebar) return;

    const tocSection = rightSidebar.querySelector('.widget.toc-widget');
    if (!tocSection) return;

    let isLocked = true; // 进入文章页默认锁定
    const LOCKED_CLASS = 'toc-locked';
    const HOVER_ZONE_PX = 48; // distance from right edge to reveal when unlocked

    // Feedback helper
    const flash = () => {
        tocSection.classList.add('toc-clicked');
        window.setTimeout(() => tocSection.classList.remove('toc-clicked'), 180);
    };

    // Toggle lock state
    const setLocked = (locked: boolean) => {
        isLocked = locked;
        document.body.classList.toggle(LOCKED_CLASS, locked);
    };

    // 点击整个目录卡片，切换锁定
    tocSection.addEventListener('click', () => {
        setLocked(!isLocked);
        // 当解锁后，开启自动显隐逻辑；锁定则关闭
        document.body.classList.toggle('toc-auto', !isLocked);
        flash();
    });

    // Auto show/hide when unlocked（含延迟与“靠近卡片不隐藏”）
    let hideTimer: number | null = null;
    const HIDE_DELAY_MS = 400; // 触发隐藏前延迟

    const onMouseMove = (e: MouseEvent) => {
        if (isLocked) return;
        // 仅在允许自动显隐时才处理（进入页面默认不自动）
        if (!document.body.classList.contains('toc-auto')) return;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        const distanceFromRight = viewportWidth - e.clientX;
        const shouldReveal = distanceFromRight <= HOVER_ZONE_PX;
        const mouseNearToc = isPointNearElement(e.clientX, e.clientY, tocSection as HTMLElement, 24);

        if (shouldReveal || mouseNearToc) {
            if (hideTimer) {
                window.clearTimeout(hideTimer);
                hideTimer = null;
            }
            rightSidebar.classList.add('reveal');
            tocSection.classList.remove('anim-out');
            tocSection.classList.add('anim-in');
            document.body.classList.remove('toc-hidden');
        } else if (!hideTimer) {
            hideTimer = window.setTimeout(() => {
                tocSection.classList.remove('anim-in');
                tocSection.classList.add('anim-out');
                // 同步收起右栏
                rightSidebar.classList.remove('reveal');
                document.body.classList.add('toc-hidden');
                hideTimer = null;
            }, HIDE_DELAY_MS);
        }
    };

    window.addEventListener('mousemove', onMouseMove);

    // 初始为显示且锁定（不播放入场动画，也不添加隐藏类）
    setLocked(true);
    rightSidebar.classList.add('reveal');
    (tocSection as HTMLElement).classList.remove('anim-in');
    (tocSection as HTMLElement).classList.remove('anim-out');
    document.body.classList.remove('toc-hidden');
    document.body.classList.remove('toc-auto');

    // When leaving window on the right, keep hidden if unlocked
    window.addEventListener('mouseleave', () => {
        if (isLocked) return;
        tocSection.classList.remove('anim-in');
        tocSection.classList.add('anim-out');
        rightSidebar.classList.remove('reveal');
        document.body.classList.add('toc-hidden');
    });
}

// 判断鼠标是否靠近某个元素（含外扩缓冲距离）
function isPointNearElement(x: number, y: number, el: HTMLElement, padding = 0): boolean {
    const rect = el.getBoundingClientRect();
    return (
        x >= rect.left - padding &&
        x <= rect.right + padding &&
        y >= rect.top - padding &&
        y <= rect.bottom + padding
    );
}


