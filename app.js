let songs = [];
let currentData = [];
let currentSort = { column: 0, direction: 1 };
let fuse;

const pageSize = 20; // 每页显示数量
let currentPage = 1; // 当前页码
let totalPages = 1;  // 总页数

fetch("songs.json")
    .then(res => res.json())
    .then(data => {
        songs = data;
        currentData = [...songs];
        renderTable();

        fuse = new Fuse(songs, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'aliases', weight: 0.3 }
            ],
            threshold: 0.4
        });

        // 回车搜索
        document.getElementById("searchInput").addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                searchSongs();
            }
        });
    });

function renderTable() {
    const tbody = document.getElementById("songTable");
    tbody.innerHTML = "";

    // 计算总页数
    totalPages = Math.ceil(currentData.length / pageSize);
    if (totalPages === 0) totalPages = 1;

    // 计算当前页数据
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const pageData = currentData.slice(start, end);

    pageData.forEach(song => {
        // 歌曲行
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50 cursor-pointer";
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${song.title}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.PST ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.PRS ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.FTR ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.BYD ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.ETR ?? '-'}</td>
        `;

        // 别名卡片行（默认隐藏）
        const cardRow = document.createElement("tr");
        cardRow.className = "alias-card hidden";
        cardRow.innerHTML = `
            <td colspan="6" class="px-6 py-4 bg-blue-50">
                <div class="p-4 border border-blue-200 rounded-lg shadow-sm">
                    <h4 class="font-medium text-blue-800 mb-2">别名</h4>
                    <p>${song.aliases && song.aliases.length > 0 
                        ? song.aliases.join("、") 
                        : "暂无别名"}</p>
                </div>
            </td>
        `;

        // 点击行切换别名卡片
        row.addEventListener("click", () => {
            cardRow.classList.toggle("hidden");
        });

        tbody.appendChild(row);
        tbody.appendChild(cardRow);
    });

    // 渲染页码选择栏
    renderPagination();
}

function renderPagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) return;

    paginationContainer.innerHTML = "";

    // 显示总页数和当前页
    const info = document.createElement("span");
    info.className = "mr-4 text-gray-600";
    info.textContent = `共 ${currentData.length} 条，${totalPages} 页，当前第 ${currentPage} 页`;
    paginationContainer.appendChild(info);

    // 首页按钮
    addPageButton("首页", 1);

    // 上一页按钮
    if (currentPage > 1) {
        addPageButton("上一页", currentPage - 1);
    }

    // 页码按钮（只显示当前页附近的页码）
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        addPageButton(i, i, i === currentPage);
    }

    // 下一页按钮
    if (currentPage < totalPages) {
        addPageButton("下一页", currentPage + 1);
    }

    // 尾页按钮
    addPageButton("尾页", totalPages);
}

function addPageButton(text, pageNum, isActive = false) {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.className = `px-3 py-1 mx-0.5 rounded ${isActive ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"}`;
    btn.addEventListener("click", () => {
        currentPage = pageNum;
        renderTable();
    });
    document.getElementById("pagination").appendChild(btn);
}

function showRandomSongs() {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    currentData = shuffled.slice(0, 10);
    renderTable(currentData);
}

function searchSongs() {
    const keyword = document.getElementById("searchInput").value.trim();
    if (!keyword) {
        currentData = [...songs];
    } else {
        const result = fuse.search(keyword);
        currentData = result.map(item => item.item);
    }
    currentPage = 1; // 搜索后重置到第一页
    renderTable();
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction *= -1;
    } else {
        currentSort.column = column;
        currentSort.direction = 1;
    }

    const sorted = [...currentData].sort((a, b) => {
        let valA, valB;
        switch(column) {
            case 0: valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); break;
            case 1: valA = a.difficulties.PST ?? -1; valB = b.difficulties.PST ?? -1; break;
            case 2: valA = a.difficulties.PRS ?? -1; valB = b.difficulties.PRS ?? -1; break;
            case 3: valA = a.difficulties.FTR ?? -1; valB = b.difficulties.FTR ?? -1; break;
            case 4: valA = a.difficulties.BYD ?? -1; valB = b.difficulties.BYD ?? -1; break;
            case 5: valA = a.difficulties.ETR ?? -1; valB = b.difficulties.ETR ?? -1; break;
        }
        return (typeof valA === 'number' && typeof valB === 'number')
            ? (valA - valB) * currentSort.direction
            : valA.localeCompare(valB) * currentSort.direction;
    });

    currentData = sorted;
    renderTable();
}

// 记录选中的难度（默认全选）
const selectedDifficulties = {
    PST: true,
    PRS: true,
    FTR: true,
    BYD: true,
    ETR: true
};

// 切换随机设置栏显示/隐藏
function toggleRandomSettings() {
    const settings = document.getElementById("randomSettings");
    settings.classList.toggle("hidden");
}

// 初始化难度按钮事件
document.querySelectorAll(".difficulty-btn").forEach(btn => {
    // 默认标记为选中
    btn.classList.add("selected");
    
    // 点击切换状态
    btn.addEventListener("click", () => {
        const difficulty = btn.dataset.difficulty;
        selectedDifficulties[difficulty] = !selectedDifficulties[difficulty];
        btn.classList.toggle("selected");
    });
});

// 显示错误提示
function showError(message) {
    // 移除已有的提示
    const existing = document.querySelector(".error-toast");
    if (existing) existing.remove();
    
    // 创建新提示
    const toast = document.createElement("div");
    toast.className = "error-toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 2秒后自动移除
    setTimeout(() => toast.remove(), 2000);
}

function showRandomSongs() {
    // 1. 获取定数范围输入
    const minLevelInput = document.getElementById("minLevel");
    const maxLevelInput = document.getElementById("maxLevel");
    const minLevel = minLevelInput.value.trim() ? parseFloat(minLevelInput.value) : null;
    const maxLevel = maxLevelInput.value.trim() ? parseFloat(maxLevelInput.value) : null;

    // 2. 获取随机条数输入（保留原始值用于验证）
    const randomCountInput = document.getElementById("randomCount");
    const rawRandomCount = randomCountInput.value.trim() ? parseInt(randomCountInput.value) : NaN;

    // 3. 验证定数范围
    if (minLevel !== null && isNaN(minLevel)) {
        showError("定数最小值请输入有效的数字！");
        return;
    }
    if (maxLevel !== null && isNaN(maxLevel)) {
        showError("定数最大值请输入有效的数字！");
        return;
    }
    if (minLevel !== null && maxLevel !== null && minLevel > maxLevel) {
        showError("定数最小值不能大于最大值！");
        return;
    }

    // 4. 验证随机条数（重点处理负数、0、非整数、非数字）
    if (isNaN(rawRandomCount) || rawRandomCount < 1 || !Number.isInteger(rawRandomCount)) {
        showError("随机条数请输入大于0的整数！");
        return;
    }

    // 5. 检查是否至少选中一个难度
    const hasAnyDifficulty = Object.values(selectedDifficulties).some(Boolean);
    if (!hasAnyDifficulty) {
        showError("请至少选择一个难度！");
        return;
    }

    // 6. 过滤符合条件的歌曲
    const filteredSongs = songs.filter(song => {
        // 6.1 检查是否包含选中的难度
        let hasSelectedDiff = false;
        Object.keys(selectedDifficulties).forEach(diff => {
            if (selectedDifficulties[diff] && song.difficulties[diff] !== undefined) {
                hasSelectedDiff = true;
            }
        });
        if (!hasSelectedDiff) return false;

        // 6.2 检查定数是否在范围内（选中的难度中至少有一个符合）
        let inLevelRange = false;
        Object.keys(selectedDifficulties).forEach(diff => {
            const level = song.difficulties[diff];
            if (selectedDifficulties[diff] && level !== undefined) {
                const aboveMin = minLevel === null || level >= minLevel;
                const belowMax = maxLevel === null || level <= maxLevel;
                if (aboveMin && belowMax) inLevelRange = true;
            }
        });
        return inLevelRange;
    });

    // 7. 检查是否有符合条件的歌曲
    if (filteredSongs.length === 0) {
        showError("没有符合条件的歌曲，请调整设置！");
        return;
    }

    // 8. 处理随机条数（不超过符合条件的总数）
    const randomCount = Math.min(rawRandomCount, filteredSongs.length);

    // 9. 随机排序并截取指定数量
    const shuffledSongs = [...filteredSongs]
        .sort(() => 0.5 - Math.random()) // 随机打乱
        .slice(0, randomCount); // 截取前N条

    // 10. 更新数据并重新渲染
    currentData = shuffledSongs;
    currentPage = 1; // 重置到第一页
    renderTable();
}