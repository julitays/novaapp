export function parseJSONFile(file, onOk, onErr) {
  try {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        onOk?.(data);
      } catch (e) {
        onErr?.(e);
      }
    };
    reader.onerror = (e) => onErr?.(e);
    reader.readAsText(file, "utf-8");
  } catch (err) {
    onErr?.(err);
  }
}
