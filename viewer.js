/* ==== 設定 ==== */
const volumes = [
    "1", "2", "3", "4", "4.5", "5",
    "6", "7", "8", "9", "9.5",
    "10", "11", "12", "12.5"
];

let book = null;
let rendition = null;
let currentVol = null;

let scale = 1;
let brightness = 1;

/* ==== 要素取得 ==== */
const epubArea = document.getElementById("epubArea");
const loader = document.getElementById("loader");

/* =========================
     パスワード
========================= */
document.getElementById("pwBtn").onclick = () => {
    const pw = document.getElementById("pwInput").value;
    if (pw === "haru33haru") {
        document.getElementById("pwBox").style.display = "none";
        renderVolumes();
        document.getElementById("volList").style.display = "grid";
    } else alert("パスワード違います");
};

/* =========================
     巻ボタン生成
========================= */
function renderVolumes() {
    const list = document.getElementById("volList");
    list.innerHTML = "";

    volumes.forEach(v => {
        const btn = document.createElement("div");
        btn.className = "volBtn";
        btn.textContent = `第${v}巻`;
        btn.onclick = () => openVolume(v);
        list.appendChild(btn);
    });
}

/* =========================
     EPUB読み込み
========================= */
async function openVolume(vol) {
    currentVol = vol;

    document.getElementById("volList").style.display = "none";
    document.getElementById("viewer").style.display = "flex";

    loader.style.display = "block";

    const url = `/books/${vol}.epub`;

    book = ePub(url);
    rendition = book.renderTo("epubArea", {
        width: "100%",
        height: "100%",
        flow: "paginated",
        spread: "none",
    });

    await rendition.display();

    loader.style.display = "none";

    updateInfo();
}

/* =========================
     次/前ページ
========================= */
function nextPage() { rendition.next(); updateInfo(); }
function prevPage() { rendition.prev(); updateInfo(); }

document.getElementById("nextBtn").onclick = nextPage;
document.getElementById("prevBtn").onclick = prevPage;

/* =========================
     章ジャンプ（簡易）
========================= */
document.querySelectorAll(".jumpBtn").forEach(btn => {
    btn.onclick = async () => {
        const move = parseInt(btn.dataset.jump);
        const toc = await book.loaded.navigation;
        let idx = toc.toc.findIndex(i => i.href === rendition.location.start.href);

        idx = Math.min(Math.max(idx + move, 0), toc.toc.length - 1);

        rendition.display(toc.toc[idx].href);
        updateInfo();
    };
});

/* =========================
     ズーム
========================= */
document.getElementById("zoomIn").onclick = () => applyZoom(1.2);
document.getElementById("zoomOut").onclick = () => applyZoom(0.8);

function applyZoom(f) {
    scale *= f;
    epubArea.style.transform = `scale(${scale})`;
}

/* =========================
     明るさ切替（ダークモードに最適化）
========================= */
document.getElementById("filterBtn").onclick = () => {
    brightness = brightness === 1 ? 0.8 : 1;
    epubArea.style.filter = `brightness(${brightness})`;
};

/* =========================
     表示情報更新
========================= */
async function updateInfo() {
    const nav = await book.loaded.navigation;
    const current = rendition.location.start.href;

    const idx = nav.toc.findIndex(i => i.href === current);

    document.getElementById("pageInfo").textContent =
        `章: ${idx + 1} / ${nav.toc.length}`;

    document.getElementById("fileName").textContent =
        `${currentVol}.epub`;
}

/* =========================
     キー操作
========================= */
document.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") nextPage();
    if (e.key === "ArrowLeft") prevPage();
});
