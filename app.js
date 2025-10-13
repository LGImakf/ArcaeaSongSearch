let songs = [];           // 全量数据
let currentData = [];     // 当前显示的数据
let currentSort = { column: 0, direction: 1 };

// 加载歌曲数据
fetch("songs.json")
    .then(res => res.json())
    .then(data => {
        songs = data;
        currentData = [...songs]; // 初始显示全部
        renderTable(currentData);
    });

function renderTable(data) {
    currentData = [...data]; // 更新当前显示的数据
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
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    if (!keyword) {
        currentData = [...songs];
    } else {
        currentData = songs.filter(song => 
            song.title.toLowerCase().includes(keyword) ||
            song.aliases.some(a => a.toLowerCase().includes(keyword))
        );
    }
    renderTable(currentData);
}

function showRandomSongs() {
    const shuffled = [...songs].sort(() => 0.5 - Math.random());
    currentData = shuffled.slice(0, 10);
    renderTable(currentData);
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.direction *= -1;
    } else {
        currentSort.column = column;
        currentSort.direction = 1;
    }
    
    // 关键：只对当前显示的数据排序
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