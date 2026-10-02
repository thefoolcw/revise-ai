/** Applies the stored theme before paint to avoid a flash. Reads localStorage only. */
export function ThemeScript() {
  const code = `(function(){try{var t=localStorage.getItem('revise-theme');if(t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
