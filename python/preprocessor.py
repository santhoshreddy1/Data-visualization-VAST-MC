import pandas as pd


# ['time', 'sewer_and_water', 'power', 'roads_and_bridges', 'medical',
#        'buildings', 'shake_intensity', 'location']

def main():
    df = pd.read_csv("mc1-reports-data.csv")

    df['time'] = pd.to_datetime(df['time'], format='%m/%d/%Y %H:%M')
    df = df.sort_values('time')

    df['time'] = df['time'].apply(lambda t: t.strftime('%Y-%m-%d %H:%M'))
    # print(df.head())

    new_df = df.groupby(['time', 'location']).aggregate({'location': 'count',
                                                         'sewer_and_water': 'mean',
                                                         'power': 'mean',
                                                         'roads_and_bridges': 'mean',
                                                         'medical': 'mean',
                                                         'buildings': 'mean',
                                                         'shake_intensity': 'mean'})

    # new_df = df.groupby(['time', 'location']).aggregate({'location': 'count',
    #                                                      'sewer_and_water': ['mean', 'std'],
    #                                                      'power': ['mean', 'std'],
    #                                                      'roads_and_bridges': ['mean', 'std'],
    #                                                      'medical': ['mean', 'std'],
    #                                                      'buildings': ['mean', 'std'],
    #                                                      'shake_intensity': ['mean', 'std']})

    # print("Before sorting:\n", new_df.head())
    # print("Columns:\n", new_df.columns)
    # print("Index:\n", new_df.index)

    new_df.index.set_names(['time', 'location_id'])
    new_df.columns = ['app_responses', 'sewer_and_water', 'power', 'roads_and_bridges',
                      'medical', 'buildings', 'shake_intensity']

    new_df.index = new_df.index.set_levels([pd.to_datetime(new_df.index.levels[0]), new_df.index.levels[1]])
    new_df = new_df.sort_index(level=0)
    new_df.to_csv(r'aggregated_mc1_data.csv', header=True)


if __name__ == "__main__":
    main()
