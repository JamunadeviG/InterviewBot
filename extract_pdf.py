import fitz

pdf_path = r"D:\Extra\Resume\Resume_.pdf"

print("📄 Reading PDF...")

doc = fitz.open(pdf_path)
lines = []

# 🔹 Extract lines
for page in doc:
    text = page.get_text("text")
    for line in text.split("\n"):
        clean = line.strip()
        if clean:
            lines.append(clean)

doc.close()

print("🔎 Detecting sections...\n")

sections = {}
current_section = "GENERAL"

def is_heading(line):
    words = line.split()
    # Check if ANY word in line matches rule
    for w in words:
        if w.isalpha() and w.isupper() and len(w) >= 5:
            return True
    return False

for line in lines:
    if is_heading(line):
        current_section = line
        sections[current_section] = []
    else:
        sections.setdefault(current_section, []).append(line)

# 🔹 Display nicely
for title, content in sections.items():
    print(f"\n{'='*10} {title} {'='*10}\n")
    print("\n".join(content))
    print("\n" + "-"*40)
