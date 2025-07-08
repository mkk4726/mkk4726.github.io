---
title: 태블러 python으로 데이터 cloud 업로드
date: 2024-07-01 12:00:00 +0900
categories: [Tableau]
tags: [Tableau, Python]
description: python으로 데이터를 tableau cloud에 올리는 코드 공유 
render_with_liquid: false
---

태블러 prep을 이용해 데이터 파이프라인을 구축해 태블러 클라우드에 데이터 웨어하우스를 구축할 수도 있지만,   
버그도 많고 제한사항이 많다고 느껴져 파이썬에서 처리한 후 업로드하는 것을 선택했습니다.   
  
업로드 하기 위해서는 2가지 과정이 필요합니다.   
1. csv to hyper
2. hypter to cloud

순서대로 코드를 공유하면서 간단히 설명하겠습니다.   

## 1. csv to hyper

태블러 클라우드에는 hyper 데이터타입이 들어가야해서 정제된 csv 파일을 hyper로 바꿔줘야 합니다.   
csv 파일을 바꾸는 것만 다루지만 다른 파일들도 쉽게 응용할 수 있을 것이라 생각합니다.   

3개의 인자를 받는데 csv 경로, hyper 저장할 경로, csv 파일 타입 정의한 객체 경로.   
csv로 저장하는 과정에서 맘대로 데이터타입이 바뀌는 문제가 있어서 타입을 정의한 객체도 따로 저장한 후에 불러올 때 참고하도록 했습니다.   

hyper 타입 데이터를 방식은 빈 테이블을 하나 만들고 채워나가는 것입니다.   
따라서 어떤 테이블을 만들 것인지를 정의해줘야합니다.  
이를 위해 columns 리스트를 정의해줍니다.   

그 다음으로는 어떤 값을 추가할지 정의해줘야합니다.  
이게 row 리스트를 정의하는 이유입니다.  
여기서 주의깊게 봐야할 것은 null값을 처리하는 방식인데 pandas dataframe의 NaN값을 None으로 바꿔서 넣어줘야합니다.   
그렇지 않으면 데이터타입이 맞지 않다는 오류가 발생합니다.  

```python
def csv_to_hyper(csv_file_path, hyper_file_path, dtype_dict_path):
    # CSV 파일 읽기
    dtype_dict = load_data(dtype_dict_path)
    df = pd.read_csv(csv_file_path, dtype=dtype_dict)

    # 테이블 정의 해주기
    columns = []
    for index, value in df.dtypes.items():
        value = str(value)
        if value == 'object':
            sql_type = SqlType.text()
        elif "float" in value:
            sql_type = SqlType.double()
        elif "int" in value:
            sql_type = SqlType.int()
        columns.append(TableDefinition.Column(index, sql_type, Nullability.NULLABLE))

    # Hyper에 추가할 값 계산하기
    rows = []
    for row in df.itertuples(index=False, name=None):
        tmp_row = []
        for item in row:
            if pd.isna(item):
                tmp_row.append(None)
            else:
                tmp_row.append(item)
        rows.append(tuple(tmp_row))

    with HyperProcess(telemetry=Telemetry.SEND_USAGE_DATA_TO_TABLEAU) as hyper:
        with Connection(endpoint=hyper.endpoint, database=hyper_file_path, create_mode=CreateMode.CREATE_AND_REPLACE) as connection:
            # 스키마 생성
            connection.catalog.create_schema('Extract')

            # 테이블 정의
            table_definition = TableDefinition(
                table_name=TableName("Extract", "Extract"),
                columns=columns
            )
            connection.catalog.create_table(table_definition)

            # 데이터를 Hyper 파일로 삽입
            with Inserter(connection, table_definition) as inserter:
                inserter.add_rows(rows=rows)
                inserter.execute()
```


## 2. hyper to cloud

여러 라이브러가 있지만 개인적으로는 "tableau_api_lib"을 추천합니다.   
관련해서는 다음 블로그를 참고하면 쉽게 사용할 수 있습니다.   
- [참고하면 좋은 블로그](https://datasciencefromsebi.tistory.com/73)


```python
def hyper_to_cloud(hyper_file_path, datasource_name):
    config = {
        'tableau_prod': {
            'server': 'https://prod-apnortheast-a.online.tableau.com',
            'api_version': '3.23',
        # 'username': '<YOUR_PROD_USERNAME>',
        # 'password': '<YOUR_PROD_PASSWORD>',
            'personal_access_token_name': '토근 이름',
            'personal_access_token_secret': '토근 정보',
            'site_name': '사이트이름',
        'site_url': '사이트이름'
        }
    }

    conn = TableauServerConnection(config_json=config, env='tableau_prod')
    conn.sign_in()

    # 데이터 소스 업로드
    response = conn.publish_data_source(
        datasource_file_path=hyper_file_path,
        datasource_name=datasource_name,
        project_id='프로젝트 아이디',
        embed_credentials_flag=False
    )

    # 업로드 결과 확인
    if response.status_code == 201:
        print(f"Datasource '{datasource_name}' published successfully.")
    else:
        print(f"Failed to publish datasource: {response.json()}")
```


이렇게 2가지 함수를 통해 태블러에 데이터 웨어하우스를 업로드하고 있습니다.  