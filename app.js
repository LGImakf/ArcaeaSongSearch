let songs = [];
let currentData = [];
let fuse; // Fuse 实例

fetch("songs.json")
    .then(res => res.json())
    .then(data => {
        songs = data;
        currentData = [...songs];
        renderTable(currentData);

        // 创建 Fuse 实例
        fuse = new Fuse(songs, {
            keys: [
                { name: 'title', weight: 0.7 },
                { name: 'aliases', weight: 0.3 }
            ],
            threshold: 0.4, // 模糊程度，越小越精确
            ignoreLocation: true
        });
    });

function renderTable(data) {
    currentData = [...data];
    const tbody = document.getElementById("songTable");
    tbody.innerHTML = "";
    data.forEach(song => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">${song.title}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.PST ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.PRS ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.FTR ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.BYD ?? '-'}</td>
            <td class="px-6 py-4 text-center">${song.difficulties.ETR ?? '-'}</td>
        `;
        tbody.appendChild(row);
    });
}

function searchSongs() {
    const keyword = document.getElementById("searchInput").value.trim();
    if (!keyword) {
        currentData = [...songs];
        renderTable(currentData);
        return;
    }

    // 模糊搜索
    const result = fuse.search(keyword);
    currentData = result.map(item => item.item);
    renderTable(currentData);
}

function showRandomSongs() {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    currentData = shuffled.slice(0, 10);
    renderTable(currentData);
}

function sortTable(column) {
    // 排序逻辑保持不变
    if (currentSort.column === column) {
        currentSort.direction *= -1;
    } else {
        currentSort.column = column;
        currentSort.direction = 1;
    }

    const sorted = [...currentData].sort((a, b) => {
        let valA, valB;
        switch(column) {
            case 0: 
                valA = a.title.toLowerCase(); 
                valB = b.title.toLowerCase(); 
                break;
            case 1: 
                valA = a.difficulties.PST ?? -1; 
                valB = b.difficulties.PST ?? -1; 
                break;
            case 2: 
                valA = a.difficulties.PRS ?? -1; 
                valB = b.difficulties.PRS ?? -1; 
                break;
            case 3: 
                valA = a.difficulties.FTR ?? -1; 
                valB = b.difficulties.FTR ?? -1; 
                break;
            case 4: 
                valA = a.difficulties.BYD ?? -1; 
                valB = b.difficulties.BYD ?? -1; 
                break;
            case 5: 
                valA = a.difficulties.ETR ?? -1; 
                valB = b.difficulties.ETR ?? -1; 
                break;
        }
        return (valA > valB ? 1 : -1) * currentSort.direction;
    });

    renderTable(sorted);
}