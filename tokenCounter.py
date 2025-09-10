import tiktoken
import fitz  # PyMuPDF : pip install pymupdf

# --- Paramètres ---
MODELE = "gpt-4o-mini"  # change en fonction de ton modèle
PDF_PATH = "CM1_tas.pdf"

# --- Fonction pour extraire le texte d'un PDF ---
def extraire_texte_pdf(path):
    doc = fitz.open(path)
    texte = ""
    for page in doc:
        texte += page.get_text("text") + "\n"
    return texte

# --- Charger l'encodeur pour le modèle choisi ---
encoding = tiktoken.encoding_for_model(MODELE)

# --- Extraire le texte du PDF ---
texte = extraire_texte_pdf(PDF_PATH)

# --- Compter les tokens ---
tokens = encoding.encode(texte)
nb_tokens = len(tokens)

print(f"Ton PDF contient {nb_tokens} tokens.")

# --- Estimation de coût (exemple pour gpt-4o-mini au 09/2025) ---
# Prix actuels : gpt-4o-mini input = $0.15 / 1M tokens
prix_input_par_token = 0.15 / 1_000_000
cout_estime = nb_tokens * prix_input_par_token

print(f"Coût estimé pour l’analyser comme input : ~${cout_estime:.6f}")