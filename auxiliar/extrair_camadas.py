import re
import csv
from bs4 import BeautifulSoup

def extrair_dados_camadas(html_file_path, csv_file_path):
    """
    Extrai informações de camadas do arquivo HTML e gera um arquivo CSV.
    
    Args:
        html_file_path (str): Caminho para o arquivo HTML com as camadas.
        csv_file_path (str): Caminho para o arquivo CSV de saída.
    """
    # Ler o arquivo HTML
    with open(html_file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Parsear o HTML com BeautifulSoup
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar todos os elementos <li> que representam camadas (com atributo 'id')
    camadas = soup.find_all('li', attrs={'id': True})
    
    # Lista para armazenar os dados das camadas
    dados_camadas = []
    
    # Expressão regular para extrair coordenadas BBOX
    bbox_pattern = re.compile(r'bbox="([^"]*)"')
    
    for camada in camadas:
        # Extrair o ID da camada
        id_camada = camada.get('id', '')
        
        # Extrair o nome da camada (atributo 'title')
        nome_camada = camada.get('title', '')
        
        # Extrair o layer (atributo 'layer')
        layer = camada.get('layer', '')
        
        # Extrair a URL do serviço (atributo 'url')
        url_servico = camada.get('url', '')
        
        # Extrair o tipo de serviço (atributo 'tipo')
        tipo_servico = camada.get('tipo', '')
        
        # Extrair o código de metadados (atributo 'metadadocode')
        metadado_code = camada.get('metadadocode', '')
        
        # Extrair as coordenadas BBOX (se existirem)
        bbox_match = bbox_pattern.search(str(camada))
        bbox = bbox_match.group(1) if bbox_match else ''
        
        # Extrair a categoria e subcategoria com base na estrutura HTML
        categoria = ''
        subcategoria = ''
        sub = ''
        
        # Encontrar o elemento <a> dentro do <li> para obter o texto
        elemento_a = camada.find('a')
        if elemento_a:
            # O texto da camada está dentro do elemento <a>
            texto_camada = elemento_a.get_text(strip=True)
            
            # Tentar extrair a hierarquia de categorias com base nos pais
            parent = camada.parent
            while parent:
                # Verificar se o pai é uma pasta (tem o atributo 'rel="folder"')
                if parent.get('rel') == 'folder':
                    # Encontrar o elemento <a> dentro desta pasta para obter o nome
                    pasta_a = parent.find('a')
                    if pasta_a:
                        nome_pasta = pasta_a.get_text(strip=True)
                        
                        # Adicionar à hierarquia de categorias
                        if not categoria:
                            categoria = nome_pasta
                        elif not subcategoria:
                            subcategoria = nome_pasta
                        elif not sub:
                            sub = nome_pasta
                
                # Subir um nível na hierarquia
                parent = parent.parent
        
        # Adicionar os dados à lista
        dados_camadas.append([
            categoria,          # Pasta / Categoria
            subcategoria,       # SubPasta
            sub,                # sub
            '',                  # (coluna vazia)
            nome_camada,        # Nome da Camada
            tipo_servico,       # Tipo
            'Sim',              # Status (assumindo que todas estão ativas)
            '',                  # Link filho (Camada) - não disponível no HTML
            url_servico,        # Link Pai (Servidor)
            'Datageo',          # Servidor
            'Não',              # Shapefile
            '',                  # Shapefile EndPoint
            metadado_code       # Cód. Metadado
        ])
    
    # Escrever os dados no arquivo CSV
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile, delimiter=';')
        
        # Escrever o cabeçalho
        writer.writerow([
            'Pasta / Categoria', 'SubPasta', 'Sub', 'sub', 'Nome da Camada', 
            'Tipo', 'Status', 'Link filho (Camada)', 'Link Pai (Servidor)', 
            'Servidor', 'Shapefile', 'Shapefile EndPoint', 'Cód. Metadado (p/ Shapefile)'
        ])
        
        # Escrever os dados
        writer.writerows(dados_camadas)
    
    print(f"Arquivo CSV gerado com sucesso: {csv_file_path}")
    print(f"Total de {len(dados_camadas)} camadas processadas.")

if __name__ == "__main__":
    # Caminhos dos arquivos
    html_file_path = "links.html"
    csv_file_path = "tb_csv_datageo_novo.csv"
    
    # Executar a extração
    extrair_dados_camadas(html_file_path, csv_file_path)