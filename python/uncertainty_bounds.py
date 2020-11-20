import pandas as pd


def main():
    x = pd.read_csv("../data/mc1-reports-data.csv")
    print(x.head)
    x = x.groupby(['location']).aggregate({'sewer_and_water': ['mean', 'std'],
                                           'power': ['mean', 'std'],
                                           'roads_and_bridges': ['mean', 'std'],
                                           'medical': ['mean', 'std'],
                                           'buildings': ['mean', 'std'],
                                           'shake_intensity': ['mean', 'std']})

    x.columns = ["_".join(x) for x in x.columns.ravel()]

    x["sewer_and_water_low"] = x['sewer_and_water_mean'] - x['sewer_and_water_std']
    x['sewer_and_water_high'] = x['sewer_and_water_mean'] + x['sewer_and_water_std']
    x["power_low"] = x['power_mean'] - x['power_std']
    x['power_high'] = x['power_mean'] + x['power_std']
    x["roads_and_bridges_low"] = x['roads_and_bridges_mean'] - x['roads_and_bridges_std']
    x['roads_and_bridges_high'] = x['roads_and_bridges_mean'] + x['roads_and_bridges_std']
    x["medical_low"] = x['medical_mean'] - x['medical_std']
    x['medical_high'] = x['medical_mean'] + x['medical_std']
    x["buildings_low"] = x['buildings_mean'] - x['buildings_std']
    x['buildings_high'] = x['buildings_mean'] + x['buildings_std']
    x["shake_intensity_low"] = x['shake_intensity_mean'] - x['shake_intensity_std']
    x['shake_intensity_high'] = x['shake_intensity_mean'] + x['shake_intensity_std']

    x = x.drop(columns=["sewer_and_water_mean", "sewer_and_water_std", 'power_std', 'power_mean',
                        "roads_and_bridges_mean", "roads_and_bridges_std", "medical_mean", "medical_std",
                        "buildings_mean", "buildings_std", "shake_intensity_mean", "shake_intensity_std"])

    x.to_csv(r'uncertainty_mc1_data.csv', header=True)


if __name__ == "__main__":
    main()
