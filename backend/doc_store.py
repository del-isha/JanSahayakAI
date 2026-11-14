"""
Document Knowledge Memory & Model Training Store for JanSahayak AI.
Allows citizens and businesses to train the model on uploaded documents (PDFs, notices, deeds, certificates).
Indexes text chunks, statutory clauses, deadlines, demand amounts, and case authorities.
Provides RAG (Retrieval-Augmented Generation) query grounding for the AI Assistant and Document Analyzer.
"""
import os, json, re, uuid
from datetime import datetime
from pathlib import Path

STORAGE_FILE = Path(__file__).parent / "trained_documents.json"

STOP_WORDS = {
    "what", "which", "where", "when", "why", "how", "are", "the", "and", "for", 
    "with", "from", "that", "this", "file", "filing", "filings", "documents", 
    "document", "online", "portal", "status", "about", "have", "been", "does", 
    "will", "would", "could", "should", "your", "give", "tell", "show", "help",
    "can", "you", "please", "required"
}

class DocumentMemory:
    def __init__(self):
        self.docs = {}
        self.load()

    def load(self):
        if STORAGE_FILE.exists():
            try:
                with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                    self.docs = json.load(f)
            except Exception:
                self.docs = {}
        else:
            self.docs = {}

    def save(self):
        try:
            with open(STORAGE_FILE, "w", encoding="utf-8") as f:
                json.dump(self.docs, f, indent=2, ensure_ascii=False)
        except Exception:
            pass

    def chunk_text(self, text: str, max_chunk_words: int = 250) -> list:
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        chunks = []
        current = []
        current_len = 0
        chunk_idx = 1

        for para in paragraphs:
            words = para.split()
            if current_len + len(words) > max_chunk_words and current:
                chunk_str = "\n".join(current)
                chunks.append({
                    "chunk_id": chunk_idx,
                    "text": chunk_str,
                    "words": current_len
                })
                chunk_idx += 1
                current = [para]
                current_len = len(words)
            else:
                current.append(para)
                current_len += len(words)

        if current:
            chunks.append({
                "chunk_id": chunk_idx,
                "text": "\n".join(current),
                "words": current_len
            })
        return chunks

    def train_document(self, text: str, filename: str = "document", case_data: dict = None) -> dict:
        doc_id = (case_data.get("id") if case_data else None) or uuid.uuid4().hex[:8]
        chunks = self.chunk_text(text)
        total_words = sum(c["words"] for c in chunks)
        token_estimate = int(total_words * 1.3)

        # Extract structured clauses and demands
        extracted = (case_data.get("extracted") if case_data else {}) or {}
        authority = extracted.get("authority")
        reference = extracted.get("reference")
        deadline = extracted.get("response_deadline")
        doc_type = extracted.get("document_type")
        clauses = extracted.get("important_clauses", [])

        # Fallback regex extraction if not provided in case_data
        if not authority or authority == "Government Department":
            auth_match = re.search(r"((?:Ministry of [A-Za-z &]+|Registrar of Companies|ROC [A-Za-z]+|Income Tax Department|GST Department|Sub-Registrar|Tehsildar|SDM|High Court|District Court)[^\n.,;]*)", text, re.I)
            authority = auth_match.group(1).strip() if auth_match else "Government Authority / Department"

        if not reference or reference == "N/A":
            ref_match = re.search(r"(?:ref(?:erence)?|notice|case|file|application|cin|gstin|pan)\s*(?:no\.?|number)?\s*[:#]?\s*([A-Z0-9/\-]{4,})", text, re.I)
            reference = ref_match.group(1).strip() if ref_match else "Ref on File"

        if not deadline or "timeline" in deadline.lower():
            date_matches = re.findall(r"\b(?:\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})\b", text, re.I)
            if date_matches:
                deadline = f"On or before {date_matches[-1]}"
            else:
                deadline = "Within 30 days of receipt"

        if not doc_type or doc_type == "Official Document":
            if re.search(r"notice|show cause|intimation|demand", text, re.I):
                doc_type = "Government Notice / Demand Order"
            elif re.search(r"deed|conveyance|encumbrance|sale", text, re.I):
                doc_type = "Property Deed / Encumbrance Certificate"
            elif re.search(r"scholarship|admission|bonafide", text, re.I):
                doc_type = "Scholarship / Institutional Document"
            else:
                doc_type = "Statutory Document / Registration"

        if not clauses:
            extracted_clauses = []
            for line in text.split("\n"):
                line = line.strip()
                if any(k in line.lower() for k in ("pursuant to", "section", "subject:", "clause", "directed to", "penalty", "liable to", "whereas")):
                    if len(line) > 15:
                        extracted_clauses.append(line[:140])
            clauses = extracted_clauses[:4] if extracted_clauses else ["Statutory verification and compliance filing required"]

        # Look for clean amounts/penalties in text
        amounts = re.findall(r"(?:₹|rs\.?|inr)\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]{2})?)", text, re.I)
        demand_str = f"₹{amounts[0]}" if amounts else "Statutory standard fee / No demand specified"

        doc_entry = {
            "id": doc_id,
            "filename": filename or "uploaded_document",
            "title": doc_type,
            "authority": authority,
            "reference": reference,
            "deadline": deadline,
            "demand_or_fee": demand_str,
            "clauses": clauses,
            "total_words": total_words,
            "token_count": token_estimate,
            "chunks_count": len(chunks),
            "chunks": chunks,
            "raw_text": text[:15000],
            "trained_at": datetime.now().isoformat(),
            "status": "trained"
        }

        self.docs[doc_id] = doc_entry
        self.save()
        return doc_entry

    def list_trained(self) -> list:
        return [
            {
                "id": d["id"],
                "filename": d["filename"],
                "title": d["title"],
                "authority": d["authority"],
                "reference": d["reference"],
                "deadline": d["deadline"],
                "demand_or_fee": d["demand_or_fee"],
                "token_count": d["token_count"],
                "chunks_count": d["chunks_count"],
                "clauses": d.get("clauses", [])[:3],
                "trained_at": d["trained_at"],
                "status": d["status"]
            }
            for d in self.docs.values()
        ]

    def get_document(self, doc_id: str):
        return self.docs.get(doc_id)

    def delete_document(self, doc_id: str) -> bool:
        if doc_id in self.docs:
            del self.docs[doc_id]
            self.save()
            return True
        return False

    def clear(self):
        self.docs = {}
        self.save()

    def query(self, query_text: str, top_k: int = 3) -> list:
        q_tokens = [t.lower() for t in re.split(r"\W+", query_text) if len(t) > 2 and t.lower() not in STOP_WORDS]
        if not self.docs:
            return []

        scored = []
        is_explicit_doc_query = any(k in query_text.lower() for k in (
            "my document", "uploaded document", "uploaded notice", "uploaded file", 
            "my notice", "this notice", "my agreement", "this document"
        ))

        for d in self.docs.values():
            doc_score = 0
            matching_chunks = []
            
            # Score overall metadata
            searchable_meta = f"{d['filename']} {d['title']} {d['authority']} {d['reference']} {d['deadline']} {d['demand_or_fee']} {' '.join(d.get('clauses', []))}".lower()
            for tok in q_tokens:
                if tok in searchable_meta:
                    doc_score += 3

            # Score chunks
            for c in d.get("chunks", []):
                chunk_score = 0
                c_low = c["text"].lower()
                for tok in q_tokens:
                    if tok in c_low:
                        chunk_score += 1
                if chunk_score > 0:
                    matching_chunks.append((chunk_score, c["text"]))

            matching_chunks.sort(key=lambda x: x[0], reverse=True)
            total_score = doc_score + sum(x[0] for x in matching_chunks[:top_k])
            
            if total_score >= 3 or is_explicit_doc_query:
                scored.append({
                    "doc_id": d["id"],
                    "filename": d["filename"],
                    "title": d["title"],
                    "authority": d["authority"],
                    "reference": d["reference"],
                    "deadline": d["deadline"],
                    "demand_or_fee": d["demand_or_fee"],
                    "clauses": d.get("clauses", []),
                    "score": total_score + (10 if is_explicit_doc_query else 0),
                    "best_chunks": [x[1] for x in matching_chunks[:top_k]]
                })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored

# Global singleton document memory
memory = DocumentMemory()
