Đó là một hướng đi rất hợp lý, việc thu hẹp phạm vi để tập trung hoàn thiện dữ liệu cho **Abnormalities** (Dị thể) và **Wings** (Các Cánh/Tổ chức) sẽ giúp bản đồ `Ruina Atlas` của bạn có chiều sâu hơn trong giai đoạn M3.

Dựa trên cơ sở dữ liệu từ Wiki chính thức trong các nguồn được cung cấp, tôi đã tổng hợp một danh sách chi tiết và chuẩn xác nhất bao gồm mã số, cấp độ của các Dị thể nổi bật cũng như các bộ máy tổ chức. Bạn có thể sử dụng trực tiếp nội dung Markdown dưới đây để đưa vào tệp `src/data/crossGameEntities.json`:

```markdown
# Dữ liệu Trọng tâm: Abnormalities và Wings / Factions

## 1. Dữ liệu Abnormalities (Dị thể)
Dưới đây là danh sách các Dị thể được phân loại theo Cấp độ Rủi ro (Risk Level), kèm theo Mã định danh (Subject Number) chuẩn xác từ hệ thống dữ liệu của Lobotomy Corporation. Bạn có thể thêm các node này vào đồ thị và gắn nhãn (tag) cấp độ rủi ro cho chúng.

### Cấp độ ZAYIN (Rủi ro thấp nhất)
* **One Sin and Hundreds of Good Deeds** (Mã: O-03-03)
* **Plague Doctor** (Mã: O-01-45)
* **Fairy Festival** (Mã: F-04-83)
* **Opened Can of WellCheers** (Mã: F-05-52)

### Cấp độ TETH
* **Scorched Girl** (Mã: F-01-02)
* **Beauty and the Beast** (Mã: F-02-44)
* **Forsaken Murderer** / **Abandoned Murderer** (Mã: T-01-54)
* **Punishing Bird** (Mã: O-02-56)

### Cấp độ HE
* **Warm-hearted Woodsman** (Mã: F-05-32)
* **Der Freischütz** (Mã: F-01-69)
* **The Snow Queen** (Mã: F-01-37)
* **Happy Teddy Bear** (Mã: T-04-06)
* **Singing Machine** (Mã: O-05-30)

### Cấp độ WAW
* **Snow White's Apple** (Mã: F-04-42)
* **Little Red Riding Hooded Mercenary** (Mã: F-01-57)
* **Big and Will be Bad Wolf** (Mã: F-02-58)
* **The Queen of Hatred** (Mã: O-01-04)
* **Big Bird** (Mã: O-02-40)
* **Judgement Bird** (Mã: O-02-62)
* **The Little Prince** (Mã: O-04-66)

### Cấp độ ALEPH (Rủi ro cao nhất)
* **Nothing There** (Mã: O-06-20)
* **The Silent Orchestra** (Mã: T-01-31)
* **WhiteNight** (Mã: T-03-46)
* **CENSORED** (Mã: O-03-89)
* **Apocalypse Bird** (Mã: O-02-63)

---

## 2. Dữ liệu Wings và Hệ thống Tổ chức (The City Factions)

Trong cấu trúc đồ thị của bạn, bạn có thể thiết lập các node Tổ chức chính và phân nhánh thành các phòng ban hoặc thế lực phụ thuộc.

### Các Wings (Cánh) và Thế lực thống trị
* **Lobotomy Corporation (L Corp):** Tổ chức trung tâm trị vì các Dị thể, là khởi nguồn cho các sự kiện.
* **Wings:** Hệ thống các tập đoàn/cánh cai quản các khu vực khác nhau trong Thành Phố (The City).
* **Thế lực Tối cao:** Bao gồm **The Head** (Đầu), **The Eye** (Mắt), và **The Claw** (Vuốt).

### Cơ cấu các phòng ban trực thuộc Lobotomy Corporation
Thay vì chỉ để một node L Corp khổng lồ, bạn có thể tạo các node nhỏ hơn tương ứng với các tổ đội (Departments) mà nhân vật từng làm việc:
* **Control Team** (Đội Kiểm soát)
* **Information Team** (Đội Thông tin)
* **Training Team** (Đội Huấn luyện)
* **Security Team** (Đội An ninh)
* **Central Command Team** (Đội Chỉ huy Trung tâm)
* **Disciplinary Team** (Đội Kỷ luật)
* **Welfare Team** (Đội Phúc lợi)
* **Extraction Team** (Đội Trích xuất)
* **Record Team** (Đội Lưu trữ)
* **Architecture Team** (Đội Kiến trúc)

### Các thế lực độc lập khác trong The City
* **Lực lượng Lính đánh thuê (Fixers):** Được chia thành các **Associations** (Hiệp hội), **Offices** (Văn phòng), và **Workshops** (Công xưởng).
* **Thế giới ngầm:** Bao gồm các **Syndicates** (Băng đảng) và **Five Fingers** (Năm Ngón Tay).
```

**Mẹo nhỏ cho UI của Ruina Atlas:** Khi đưa dữ liệu Dị thể này vào tệp `crossGameEntities.json`, bạn có thể thêm một trường thuộc tính `riskLevel` (ví dụ: `ZAYIN`, `ALEPH`). Sau đó ở phần `EntityPanel` trên giao diện, bạn có thể gán màu sắc hiển thị khác nhau dựa trên mức độ rủi ro này để đồ thị nhìn trực quan và giống với game gốc hơn.
