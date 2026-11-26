import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-8 text-sm sm:px-6">
        <span>cyber-shot · 人物写真素材库</span>
        <nav aria-label="页脚导航" className="flex gap-4">
          <Link
            className="can-hover:hover:text-foreground transition-colors"
            to="/hair"
          >
            发型库
          </Link>
          <Link
            className="can-hover:hover:text-foreground transition-colors"
            to="/pose"
          >
            姿势库
          </Link>
        </nav>
      </div>
    </footer>
  );
}
