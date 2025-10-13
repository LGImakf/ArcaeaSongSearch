# 本工具用于生成带有别名的 songs.json 文件
# 需要一个 alias.json 文件，格式为 { "歌曲名": ["别名1", "别名2"] }
# 运行后会生成一个新的 songs.json 文件，包含别名信息

import requests
from bs4 import BeautifulSoup
import json

WIKI_URL = "https://arcwiki.mcd.blue/%E5%AE%9A%E6%95%B0%E8%AF%A6%E8%A1%A8"

def fetch_wiki_table(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def parse_song_difficulties(html):
    soup = BeautifulSoup(html, "html.parser")
    table = soup.find("table", class_="wikitable")
    tbody = table.find("tbody")
    songs = []
    for row in tbody.find_all("tr"):
        cols = row.find_all("td")
        if len(cols) < 6:
            continue
        title = cols[0].get_text(strip=True)
        def get_value(col):
            val = col.get_text(strip=True)
            return float(val) if val else None
        difficulties = {
            "PST": get_value(cols[1]),
            "PRS": get_value(cols[2]),
            "FTR": get_value(cols[3]),
            "BYD": get_value(cols[4]),
            "ETR": get_value(cols[5])
        }
        songs.append({
            "title": title,
            "difficulties": difficulties,
            "aliases": []  # 初始为空列表
        })
    return songs

def load_aliases(filename="alias.json"):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            return json.load(f)  # { "歌曲名": ["别名1", "别名2"] }
    except FileNotFoundError:
        print("别名文件不存在，使用空别名")
        return {}

# 获取歌曲数据
html = fetch_wiki_table(WIKI_URL)
songs = parse_song_difficulties(html)

# 合并别名
alias_data = load_aliases()
for song in songs:
    if song["title"] in alias_data:
        song["aliases"] = alias_data[song["title"]]

# 保存为 JSON
with open("songs.json", "w", encoding="utf-8") as f:
    json.dump(songs, f, ensure_ascii=False, indent=2)

print("生成带别名的 songs.json 成功！")
