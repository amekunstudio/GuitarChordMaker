document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const display = document.getElementById('song-display');
    const saveBtn = document.getElementById('save-btn');
    const printBtn = document.getElementById('print-btn');
    const toast = document.getElementById('toast');

    // 1. 初期データ読み込み
    const storageKey = 'chord_pro_data';
    const savedContent = localStorage.getItem(storageKey);
    
    const initialText = `[G]Everything is [D]bright
[Em]In the middle of the [C]night
[G] [D] [C] [C]

[G]日本語の[D]歌詞でも
[Em]ズレること[C]なく表示されます`;

    editor.value = savedContent ? savedContent : initialText;

    // 2. 解析・レンダリングエンジン
    function render() {
        const text = editor.value;
        const lines = text.split('\n');
        let html = '';

        lines.forEach(line => {
            if (!line.trim()) {
                html += '<div class="chord-line" style="height:2rem;"></div>';
                return;
            }

            let lineHtml = '<div class="chord-line">';
            const regex = /\[(.*?)\]/g;
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(line)) !== null) {
                // コードの前の歌詞
                const textBefore = line.substring(lastIndex, match.index);
                if (textBefore) {
                    lineHtml += createBlock('', textBefore);
                }

                const chord = match[1];
                lastIndex = regex.lastIndex;

                // 次のコードまでの歌詞
                const nextBracket = line.indexOf('[', lastIndex);
                const textAfter = (nextBracket !== -1) 
                                ? line.substring(lastIndex, nextBracket) 
                                : line.substring(lastIndex);

                lineHtml += createBlock(chord, textAfter || ' ');
                
                lastIndex += textAfter.length;
                regex.lastIndex = lastIndex;
            }

            // コードが全くない行、または行末の残分
            if (lastIndex < line.length) {
                lineHtml += createBlock('', line.substring(lastIndex));
            }

            lineHtml += '</div>';
            html += lineHtml;
        });

        display.innerHTML = html;
    }

    function createBlock(chord, lyric) {
        return `
            <div class="chord-pair">
                <span class="chord">${escape(chord)}</span>
                <span class="lyric">${escape(lyric)}</span>
            </div>`;
    }

    function escape(str) {
        return str.replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[m]));
    }

    // 3. セーブ機能
    function saveData() {
        localStorage.setItem(storageKey, editor.value);
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // 4. イベント登録
    editor.addEventListener('input', render);
    
    saveBtn.addEventListener('click', saveData);
    
    printBtn.addEventListener('click', () => window.print());

    // Ctrl+S / Cmd+S ショートカット
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveData();
        }
    });

    // 初回実行
    render();
});