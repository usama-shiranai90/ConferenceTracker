import networkx as nx
import community.community_louvain as community_louvain
import logging
from typing import List, Dict, Any
from collections import Counter

logger = logging.getLogger(__name__)

class NetworkService:
    def __init__(self):
        pass

    def build_coauthorship_graph(self, papers: List[Dict]) -> nx.Graph:
        """
        FR-4.1.1: Co-authorship Graph Construction
        """
        G = nx.Graph()
        
        for paper in papers:
            authors = paper.get("authors", [])
            # authors is list of strings or objects with names
            author_names = [a if isinstance(a, str) else a.name for a in authors]
            
            # Add nodes
            for author in author_names:
                if not G.has_node(author):
                    G.add_node(author, paper_count=0)
                G.nodes[author]['paper_count'] += 1
            
            # Add edges (cliques for each paper)
            import itertools
            for u, v in itertools.combinations(author_names, 2):
                if G.has_edge(u, v):
                    G[u][v]['weight'] += 1
                else:
                    G.add_edge(u, v, weight=1)
        
        return G

    def calculate_influence_metrics(self, G: nx.Graph) -> Dict[str, Dict]:
        """
        FR-4.1.2: Author Influence Metrics
        """
        logger.info("Computing centrality metrics...")
        
        degree = nx.degree_centrality(G)
        betweenness = nx.betweenness_centrality(G, k=min(100, len(G))) # Approx for speed if large
        try:
            eigenvector = nx.eigenvector_centrality(G, max_iter=100)
        except:
            eigenvector = {n: 0 for n in G.nodes()} # Fallback if fails to converge
            
        pagerank = nx.pagerank(G)
        
        results = {}
        for node in G.nodes():
            results[node] = {
                "degree": degree[node],
                "betweenness": betweenness[node],
                "eigenvector": eigenvector[node],
                "pagerank": pagerank[node]
            }
        return results

    def detect_communities(self, G: nx.Graph) -> Dict[str, int]:
        """
        FR-4.1.3: Research Community Detection
        """
        if len(G.nodes) == 0:
            return {}
            
        # Python-louvain expects undirected graph
        partition = community_louvain.best_partition(G, weight='weight')
        return partition

    def build_citation_network(self, papers: List[Dict]) -> nx.DiGraph:
        """
        FR-4.2.1: Citation Graph Construction (Directed)
        """
        G = nx.DiGraph()
        
        for paper in papers:
            paper_id = paper.get("id")
            if not paper_id: continue
            
            G.add_node(paper_id, title=paper.get("title"))
            
            # Assuming 'citations' is a list of paper IDs this paper cites
            citations = paper.get("citations", [])
            for cited_id in citations:
                G.add_edge(paper_id, cited_id)
                
        return G
