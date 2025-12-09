import csv
from bs4 import BeautifulSoup

def extrair_camadas():
    # Ler o arquivo HTML
    with open('links.html', 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Parsear o HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar a div raiz com id="camadas"
    div_camadas = soup.find('div', id='camadas')
    
    # Lista para armazenar os dados
    dados = []
    
    # Cabeçalho do CSV
    cabecalho = ["Pasta / Categoria", "SubPasta", "Sub", "sub", "Nome da Camada", "Tipo", "Status", "Link filho (Camada)", "Link Pai (Servidor)", "Servidor", "Shapefile", "Shapefile EndPoint", "Cód. Metadado (p/ Shapefile)"]
    dados.append(cabecalho)
    
    # Função recursiva para processar os nós da árvore
    def processar_no(no, caminho_pasta=[]):
        # Verificar se é um nó de pasta (rel="folder")
        if no.get('rel') == 'folder':
            # Extrair o nome da pasta
            a_tag = no.find('a')
            if a_tag:
                # Extrair apenas o texto, ignorando os elementos filhos
                nome_pasta = ''.join(text for text in a_tag.contents if isinstance(text, str)).strip()
                novo_caminho = caminho_pasta + [nome_pasta]
                
                # Processar os filhos
                ul_filho = no.find('ul')
                if ul_filho:
                    for li_filho in ul_filho.find_all('li', recursive=False):
                        processar_no(li_filho, novo_caminho)
        
        # Verificar se é um nó de arquivo (rel="file")
        elif no.get('rel') == 'file':
            # Extrair os atributos do nó
            nome_camada = no.get('title', '')
            url = no.get('url', '')
            tipo = no.get('tipo', 'WMS')
            metadadocode = no.get('metadadocode', '')
            
            # Determinar o servidor com base na URL
            servidor = "Datageo"
            if "igc.sp.gov.br" in url:
                servidor = "IGC"
            elif "ibge.gov.br" in url:
                servidor = "IBGE"
            elif "ipt.br" in url:
                servidor = "IPT"
            elif "cetesb" in url or "CETESB" in nome_camada:
                servidor = "CETESB"
            
            # Mapear o caminho da pasta para as colunas
            pasta = caminho_pasta[0] if len(caminho_pasta) > 0 else ""
            subpasta = caminho_pasta[1] if len(caminho_pasta) > 1 else ""
            sub = caminho_pasta[2] if len(caminho_pasta) > 2 else ""
            sub_sub = caminho_pasta[3] if len(caminho_pasta) > 3 else ""
            
            # Adicionar os dados à lista
            dados.append([
                pasta, subpasta, sub, sub_sub,
                nome_camada,
                tipo,
                "Sim",  # Status
                "",     # Link filho (Camada)
                url,    # Link Pai (Servidor)
                servidor,
                "Não",  # Shapefile
                "",     # Shapefile EndPoint
                metadadocode
            ])
    
    # Iniciar o processamento a partir dos nós li diretos da div
    if div_camadas:
        ul_principal = div_camadas.find('ul')
        if ul_principal:
            for li in ul_principal.find_all('li', recursive=False):
                processar_no(li)
    
    # Escrever os dados em um arquivo CSV
    with open('tb_csv_datageo_atualizado.csv', 'w', newline='', encoding='utf-8') as arquivo_csv:
        escritor = csv.writer(arquivo_csv, delimiter=';')
        escritor.writerows(dados)
    
    print(f"Arquivo CSV gerado com sucesso: tb_csv_datageo_atualizado.csv")
    print(f"Total de {len(dados)-1} camadas processadas.")

if __name__ == "__main__":
    extrair_camadas()