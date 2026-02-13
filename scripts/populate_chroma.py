#!/usr/bin/env python3
"""
Populate ChromaDB with Agent Registry documentation.

This script indexes all markdown documentation files into ChromaDB
for retrieval by the Retrieval Agent.
"""

import os
import sys
from pathlib import Path
from typing import List, Dict
import chromadb
from chromadb.config import Settings
import hashlib

# Configuration
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))
CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "agent_registry_docs")
DOCS_DIR = Path(__file__).parent.parent / "docs"


def get_chroma_client():
    """Initialize ChromaDB client."""
    return chromadb.HttpClient(
        host=CHROMA_HOST,
        port=CHROMA_PORT,
        settings=Settings(allow_reset=True)
    )


def generate_doc_id(file_path: str, chunk_index: int = 0) -> str:
    """Generate unique document ID."""
    content = f"{file_path}:{chunk_index}"
    return hashlib.md5(content.encode()).hexdigest()


def chunk_markdown(content: str, max_chunk_size: int = 1000) -> List[str]:
    """
    Split markdown content into chunks.
    
    Tries to split on headers first, then paragraphs, then sentences.
    """
    chunks = []
    
    # Split on headers (##, ###, etc.)
    sections = []
    current_section = []
    
    for line in content.split('\n'):
        if line.startswith('#'):
            if current_section:
                sections.append('\n'.join(current_section))
                current_section = []
        current_section.append(line)
    
    if current_section:
        sections.append('\n'.join(current_section))
    
    # Further split large sections
    for section in sections:
        if len(section) <= max_chunk_size:
            chunks.append(section)
        else:
            # Split on paragraphs
            paragraphs = section.split('\n\n')
            current_chunk = []
            current_size = 0
            
            for para in paragraphs:
                para_size = len(para)
                if current_size + para_size > max_chunk_size and current_chunk:
                    chunks.append('\n\n'.join(current_chunk))
                    current_chunk = [para]
                    current_size = para_size
                else:
                    current_chunk.append(para)
                    current_size += para_size
            
            if current_chunk:
                chunks.append('\n\n'.join(current_chunk))
    
    return [chunk.strip() for chunk in chunks if chunk.strip()]


def extract_metadata(file_path: Path, content: str) -> Dict[str, str]:
    """Extract metadata from markdown file."""
    metadata = {
        "source": str(file_path.relative_to(DOCS_DIR.parent)),
        "type": "documentation",
    }
    
    # Extract title from first header
    for line in content.split('\n'):
        if line.startswith('# '):
            metadata["title"] = line[2:].strip()
            break
    
    # Categorize by directory
    parts = file_path.relative_to(DOCS_DIR).parts
    if len(parts) > 1:
        metadata["category"] = parts[0]
    
    # Add tags based on content
    tags = []
    if "agent" in content.lower():
        tags.append("agent")
    if "orchestrat" in content.lower():
        tags.append("orchestration")
    if "mcp" in content.lower():
        tags.append("mcp")
    if "chroma" in content.lower():
        tags.append("chromadb")
    if "api" in content.lower():
        tags.append("api")
    
    if tags:
        metadata["tags"] = ",".join(tags)
    
    return metadata


def index_document(collection, file_path: Path):
    """Index a single markdown document."""
    print(f"Indexing: {file_path.relative_to(DOCS_DIR.parent)}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extract metadata
    metadata = extract_metadata(file_path, content)
    
    # Chunk content
    chunks = chunk_markdown(content)
    
    # Prepare batch data
    ids = []
    documents = []
    metadatas = []
    
    for i, chunk in enumerate(chunks):
        doc_id = generate_doc_id(str(file_path), i)
        ids.append(doc_id)
        documents.append(chunk)
        
        # Add chunk-specific metadata
        chunk_metadata = metadata.copy()
        chunk_metadata["chunk_index"] = str(i)
        chunk_metadata["total_chunks"] = str(len(chunks))
        metadatas.append(chunk_metadata)
    
    # Add to collection
    collection.add(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )
    
    print(f"  ✓ Indexed {len(chunks)} chunks")


def index_all_docs():
    """Index all markdown files in docs directory."""
    print(f"Connecting to ChromaDB at {CHROMA_HOST}:{CHROMA_PORT}")
    
    try:
        client = get_chroma_client()
    except Exception as e:
        print(f"❌ Failed to connect to ChromaDB: {e}")
        print("\nMake sure ChromaDB is running:")
        print("  docker run -p 8000:8000 chromadb/chroma")
        sys.exit(1)
    
    # Get or create collection
    try:
        collection = client.get_collection(CHROMA_COLLECTION)
        print(f"Using existing collection: {CHROMA_COLLECTION}")
        
        # Ask to clear existing data
        response = input("Clear existing data? (y/N): ")
        if response.lower() == 'y':
            client.delete_collection(CHROMA_COLLECTION)
            collection = client.create_collection(CHROMA_COLLECTION)
            print("Collection cleared")
    except:
        collection = client.create_collection(CHROMA_COLLECTION)
        print(f"Created new collection: {CHROMA_COLLECTION}")
    
    # Find all markdown files
    md_files = list(DOCS_DIR.rglob("*.md"))
    print(f"\nFound {len(md_files)} markdown files")
    
    # Index each file
    indexed = 0
    failed = 0
    
    for file_path in md_files:
        try:
            index_document(collection, file_path)
            indexed += 1
        except Exception as e:
            print(f"  ❌ Failed: {e}")
            failed += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Indexing complete!")
    print(f"  ✓ Indexed: {indexed} files")
    if failed > 0:
        print(f"  ❌ Failed: {failed} files")
    
    # Collection stats
    count = collection.count()
    print(f"\nCollection '{CHROMA_COLLECTION}' now contains {count} chunks")


def test_retrieval():
    """Test retrieval with sample queries."""
    print(f"\n{'='*60}")
    print("Testing retrieval...")
    
    client = get_chroma_client()
    collection = client.get_collection(CHROMA_COLLECTION)
    
    test_queries = [
        "How do I configure ChromaDB?",
        "What agents are available?",
        "Explain orchestration patterns",
        "How to use MCP tools?",
    ]
    
    for query in test_queries:
        print(f"\nQuery: {query}")
        results = collection.query(
            query_texts=[query],
            n_results=3
        )
        
        if results['documents'] and results['documents'][0]:
            for i, doc in enumerate(results['documents'][0], 1):
                metadata = results['metadatas'][0][i-1]
                print(f"\n  Result {i}:")
                print(f"    Source: {metadata.get('source', 'unknown')}")
                print(f"    Title: {metadata.get('title', 'N/A')}")
                print(f"    Preview: {doc[:100]}...")
        else:
            print("  No results found")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Populate ChromaDB with documentation")
    parser.add_argument("--test", action="store_true", help="Run test queries after indexing")
    parser.add_argument("--test-only", action="store_true", help="Only run test queries")
    args = parser.parse_args()
    
    if not args.test_only:
        index_all_docs()
    
    if args.test or args.test_only:
        test_retrieval()
