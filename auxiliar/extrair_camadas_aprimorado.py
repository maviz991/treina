import csv
from bs4 import BeautifulSoup

def extrair_camadas():
    # Ler o arquivo HTML
    with open('links.html', 'r', encoding='utf-8') as file:
        html_content = file.read()
    
    # Parsear o HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontrar todas as tabelas
    tabelas = soup.find_all('table')
    
    # Lista para armazenar os dados
    dados = []
    
    # Cabeçalho do CSV
    cabecalho = ["Pasta / Categoria", "SubPasta", "Sub", "sub", "Nome da Camada", "Tipo", "Status", "Link filho (Camada)", "Link Pai (Servidor)", "Servidor", "Shapefile", "Shapefile EndPoint", "Cód. Metadado (p/ Shapefile)"]
    dados.append(cabecalho)
    
    # Processar cada tabela
    for tabela in tabelas:
        linhas = tabela.find_all('tr')
        
        for linha in linhas[1:]:  # Pular o cabeçalho da tabela
            colunas = linha.find_all('td')
            
            if len(colunas) >= 5:  # Verificar se há colunas suficientes
                # Extrair informações das colunas
                categoria = colunas[0].get_text(strip=True) if len(colunas) > 0 else ""
                subpasta = colunas[1].get_text(strip=True) if len(colunas) > 1 else ""
                sub = colunas[2].get_text(strip=True) if len(colunas) > 2 else ""
                sub_sub = colunas[3].get_text(strip=True) if len(colunas) > 3 else ""
                nome_camada = colunas[4].get_text(strip=True) if len(colunas) > 4 else ""
                
                # Extrair o link da camada
                link_camada = ""
                link_element = colunas[4].find('a')
                if link_element and link_element.has_attr('href'):
                    link_camada = link_element['href']
                
                # Valores padrão para as outras colunas
                tipo = "WMS"  # Assumindo que a maioria é WMS
                status = "Sim"  # Assumindo que a maioria está ativa
                link_pai = ""
                servidor = "Datageo"  # Assumindo que a maioria é do Datageo
                shapefile = "Não"  # Assumindo que a maioria não tem shapefile
                shapefile_endpoint = ""
                cod_metadado = ""
                
                # Tentar extrair o código de metadado do link ou de outro atributo
                if link_camada:
                    # Extrair o código que está entre chaves no link
                    import re
                    match = re.search(r'\{([^\}]+)\}', link_camada)
                    if match:
                        cod_metadado = "{" + match.group(1) + "}"
                
                # Adicionar os dados à lista
                dados.append([categoria, subpasta, sub, sub_sub, nome_camada, tipo, status, link_camada, link_pai, servidor, shapefile, shapefile_endpoint, cod_metadado])
    
    # Escrever os dados em um arquivo CSV
    with open('tb_csv_datageo_novo_aprimorado.csv', 'w', newline='', encoding='utf-8') as arquivo_csv:
        escritor = csv.writer(arquivo_csv, delimiter=';')
        escritor.writerows(dados)
    
    print(f"Arquivo CSV gerado com sucesso: tb_csv_datageo_novo_aprimorado.csv")
    print(f"Total de {len(dados)-1} camadas processadas.")

if __name__ == "__main__":
    extrair_camadas()