// src/constants/carData_static.ts

export interface CarMake {
    id: string;
    name: string;
    models: CarModel[];
  }
  
  export interface CarModel {
    id: string;
    name: string;
    generations: CarGeneration[];
  }
  
  export interface CarGeneration {
    id: string;
    name: string;
    years: string;
    bodyStyles: CarBodyStyle[];
  }
  
  export interface CarBodyStyle {
    id: string;
    name: string;
  }
  
  // (Comment removed - was in Arabic)
  export const CAR_DATA: CarMake[] = [
    {
      "id": "abt",
      "name": "ABT",
      "models": [
        {
          "id": "abt_sportsline",
          "name": "ABT Sportsline",
          "generations": [
            {
              "id": "abt_sportsline_gen_1",
              "name": "Current Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "ac_schnitzer",
      "name": "AC Schnitzer",
      "models": [
        {
          "id": "ac_schnitzer_bmw",
          "name": "BMW Tuned",
          "generations": [
            {
              "id": "ac_schnitzer_bmw_gen_1",
              "name": "Current Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                },
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "acura",
      "name": "Acura",
      "models": [
        {
          "id": "acura_mdx",
          "name": "MDX",
          "generations": [
            {
              "id": "acura_mdx_gen_1",
              "name": "Current Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "acura_rdx",
          "name": "RDX",
          "generations": [
            {
              "id": "acura_rdx_gen_1",
              "name": "Current Generation",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "acura_tlx",
          "name": "TLX",
          "generations": [
            {
              "id": "acura_tlx_gen_1",
              "name": "Current Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "alfa_romeo",
      "name": "Alfa Romeo",
      "models": [
        {
          "id": "alfa_romeo_giulia",
          "name": "Giulia",
          "generations": [
            {
              "id": "alfa_romeo_giulia_gen_1",
              "name": "Current Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "alfa_romeo_stelvio",
          "name": "Stelvio",
          "generations": [
            {
              "id": "alfa_romeo_stelvio_gen_1",
              "name": "Current Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "alfa_romeo_tonale",
          "name": "Tonale",
          "generations": [
            {
              "id": "alfa_romeo_tonale_gen_1",
              "name": "Current Generation",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "alpina",
      "name": "Alpina",
      "models": [
        {
          "id": "alpina_b3",
          "name": "B3",
          "generations": [
            {
              "id": "alpina_b3_gen_1",
              "name": "Current Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "alpina_b8",
          "name": "B8",
          "generations": [
            {
              "id": "alpina_b8_gen_1",
              "name": "Current Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                },
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "alpine",
      "name": "Alpine",
      "models": [
        {
          "id": "alpine_a110",
          "name": "A110",
          "generations": [
            {
              "id": "alpine_a110_gen_1",
              "name": "Current Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "aston_martin",
      "name": "Aston Martin",
      "models": [
        {
          "id": "aston_martin_vantage",
          "name": "Vantage",
          "generations": [
            {
              "id": "aston_martin_vantage_gen_1",
              "name": "Current Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "aston_martin_dbs",
          "name": "DBS",
          "generations": [
            {
              "id": "aston_martin_dbs_gen_1",
              "name": "Current Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "aston_martin_dbx",
          "name": "DBX",
          "generations": [
            {
              "id": "aston_martin_dbx_gen_1",
              "name": "Current Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "audi",
      "name": "Audi",
      "models": [
        {
          "id": "audi_a3",
          "name": "A3",
          "generations": [
            {
              "id": "audi_a3_gen_4",
              "name": "4th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_a4",
          "name": "A4",
          "generations": [
            {
              "id": "audi_a4_gen_5",
              "name": "5th Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_a6",
          "name": "A6",
          "generations": [
            {
              "id": "audi_a6_gen_5",
              "name": "5th Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_a8",
          "name": "A8",
          "generations": [
            {
              "id": "audi_a8_gen_4",
              "name": "4th Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_q5",
          "name": "Q5",
          "generations": [
            {
              "id": "audi_q5_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_q7",
          "name": "Q7",
          "generations": [
            {
              "id": "audi_q7_gen_2",
              "name": "2nd Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_q8",
          "name": "Q8",
          "generations": [
            {
              "id": "audi_q8_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_tt",
          "name": "TT",
          "generations": [
            {
              "id": "audi_tt_gen_3",
              "name": "3rd Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "audi_r8",
          "name": "R8",
          "generations": [
            {
              "id": "audi_r8_gen_2",
              "name": "2nd Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "bentley",
      "name": "Bentley",
      "models": [
        {
          "id": "bentley_continental_gt",
          "name": "Continental GT",
          "generations": [
            {
              "id": "bentley_continental_gt_gen_3",
              "name": "3rd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "bentley_flying_spur",
          "name": "Flying Spur",
          "generations": [
            {
              "id": "bentley_flying_spur_gen_3",
              "name": "3rd Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bentley_bentayga",
          "name": "Bentayga",
          "generations": [
            {
              "id": "bentley_bentayga_gen_1",
              "name": "1st Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "bmw",
      "name": "BMW",
      "models": [
        {
          "id": "bmw_1_series",
          "name": "1 Series",
          "generations": [
            {
              "id": "bmw_1_series_gen_3",
              "name": "3rd Generation (F40)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_2_series",
          "name": "2 Series",
          "generations": [
            {
              "id": "bmw_2_series_coupe_gen_1",
              "name": "Coupe (G42)",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            },
            {
              "id": "bmw_2_series_gran_coupe_gen_1",
              "name": "Gran Coupe (F44)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_3_series",
          "name": "3 Series",
          "generations": [
            {
              "id": "bmw_3_series_gen_7",
              "name": "7th Generation (G20)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_4_series",
          "name": "4 Series",
          "generations": [
            {
              "id": "bmw_4_series_coupe_gen_2",
              "name": "Coupe (G22)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            },
            {
              "id": "bmw_4_series_convertible_gen_2",
              "name": "Convertible (G23)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_5_series",
          "name": "5 Series",
          "generations": [
            {
              "id": "bmw_5_series_gen_8",
              "name": "8th Generation (G30)",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_7_series",
          "name": "7 Series",
          "generations": [
            {
              "id": "bmw_7_series_gen_6",
              "name": "6th Generation (G11/G12)",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_x1",
          "name": "X1",
          "generations": [
            {
              "id": "bmw_x1_gen_3",
              "name": "3rd Generation (U11)",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_x3",
          "name": "X3",
          "generations": [
            {
              "id": "bmw_x3_gen_4",
              "name": "4th Generation (G45)",
              "years": "2024-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_x5",
          "name": "X5",
          "generations": [
            {
              "id": "bmw_x5_gen_4",
              "name": "4th Generation (G05)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_x6",
          "name": "X6",
          "generations": [
            {
              "id": "bmw_x6_gen_3",
              "name": "3rd Generation (G06)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_x7",
          "name": "X7",
          "generations": [
            {
              "id": "bmw_x7_gen_2",
              "name": "2nd Generation (G07)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_z4",
          "name": "Z4",
          "generations": [
            {
              "id": "bmw_z4_gen_3",
              "name": "3rd Generation (G29)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_i4",
          "name": "i4",
          "generations": [
            {
              "id": "bmw_i4_gen_1",
              "name": "1st Generation (G26)",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_i7",
          "name": "i7",
          "generations": [
            {
              "id": "bmw_i7_gen_1",
              "name": "1st Generation (G70)",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_m2",
          "name": "M2",
          "generations": [
            {
              "id": "bmw_m2_gen_2",
              "name": "2nd Generation (G87)",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_m3",
          "name": "M3",
          "generations": [
            {
              "id": "bmw_m3_gen_6",
              "name": "6th Generation (G80)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "bmw_m4",
          "name": "M4",
          "generations": [
            {
              "id": "bmw_m4_coupe_gen_2",
              "name": "Coupe (G82)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            },
            {
              "id": "bmw_m4_convertible_gen_2",
              "name": "Convertible (G83)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "bugatti",
      "name": "Bugatti",
      "models": [
        {
          "id": "bugatti_chiron",
          "name": "Chiron",
          "generations": [
            {
              "id": "bugatti_chiron_gen_1",
              "name": "1st Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "bugatti_divo",
          "name": "Divo",
          "generations": [
            {
              "id": "bugatti_divo_gen_1",
              "name": "1st Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "cadillac",
      "name": "Cadillac",
      "models": [
        {
          "id": "cadillac_ct4",
          "name": "CT4",
          "generations": [
            {
              "id": "cadillac_ct4_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "cadillac_ct5",
          "name": "CT5",
          "generations": [
            {
              "id": "cadillac_ct5_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "cadillac_escalade",
          "name": "Escalade",
          "generations": [
            {
              "id": "cadillac_escalade_gen_5",
              "name": "5th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "cadillac_xt5",
          "name": "XT5",
          "generations": [
            {
              "id": "cadillac_xt5_gen_1",
              "name": "1st Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "cadillac_xt6",
          "name": "XT6",
          "generations": [
            {
              "id": "cadillac_xt6_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "chevrolet",
      "name": "Chevrolet",
      "models": [
        {
          "id": "chevrolet_camaro",
          "name": "Camaro",
          "generations": [
            {
              "id": "chevrolet_camaro_gen_6",
              "name": "6th Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "chevrolet_corvette",
          "name": "Corvette",
          "generations": [
            {
              "id": "chevrolet_corvette_gen_8",
              "name": "8th Generation (C8)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "chevrolet_malibu",
          "name": "Malibu",
          "generations": [
            {
              "id": "chevrolet_malibu_gen_9",
              "name": "9th Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "chevrolet_silverado",
          "name": "Silverado",
          "generations": [
            {
              "id": "chevrolet_silverado_gen_4",
              "name": "4th Generation (GMT K2XX)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "pickup",
                  "name": "Pickup Truck"
                }
              ]
            }
          ]
        },
        {
          "id": "chevrolet_tahoe",
          "name": "Tahoe",
          "generations": [
            {
              "id": "chevrolet_tahoe_gen_5",
              "name": "5th Generation (GMT1XX)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "chrysler",
      "name": "Chrysler",
      "models": [
        {
          "id": "chrysler_300",
          "name": "300",
          "generations": [
            {
              "id": "chrysler_300_gen_3",
              "name": "3rd Generation",
              "years": "2011-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "chrysler_pacifica",
          "name": "Pacifica",
          "generations": [
            {
              "id": "chrysler_pacifica_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "minivan",
                  "name": "Minivan"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "citroen",
      "name": "Citroën",
      "models": [
        {
          "id": "citroen_c3",
          "name": "C3",
          "generations": [
            {
              "id": "citroen_c3_gen_3",
              "name": "3rd Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "citroen_c4",
          "name": "C4",
          "generations": [
            {
              "id": "citroen_c4_gen_2",
              "name": "2nd Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "citroen_c5_x",
          "name": "C5 X",
          "generations": [
            {
              "id": "citroen_c5_x_gen_1",
              "name": "1st Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "liftback",
                  "name": "Liftback"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "dacia",
      "name": "Dacia",
      "models": [
        {
          "id": "dacia_spring",
          "name": "Spring",
          "generations": [
            {
              "id": "dacia_spring_gen_1",
              "name": "1st Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "dacia_jogger",
          "name": "Jogger",
          "generations": [
            {
              "id": "dacia_jogger_gen_1",
              "name": "1st Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "mpv",
                  "name": "MPV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "dodge",
      "name": "Dodge",
      "models": [
        {
          "id": "dodge_challenger",
          "name": "Challenger",
          "generations": [
            {
              "id": "dodge_challenger_gen_3",
              "name": "3rd Generation (LC)",
              "years": "2008-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "dodge_charger",
          "name": "Charger",
          "generations": [
            {
              "id": "dodge_charger_gen_7",
              "name": "7th Generation (LD)",
              "years": "2011-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "dodge_durango",
          "name": "Durango",
          "generations": [
            {
              "id": "dodge_durango_gen_3",
              "name": "3rd Generation (WD)",
              "years": "2011-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "ferrari",
      "name": "Ferrari",
      "models": [
        {
          "id": "ferrari_488",
          "name": "488",
          "generations": [
            {
              "id": "ferrari_488_gen_1",
              "name": "1st Generation",
              "years": "2015-2020",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "ferrari_f8",
          "name": "F8",
          "generations": [
            {
              "id": "ferrari_f8_gen_1",
              "name": "1st Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "ferrari_sf90",
          "name": "SF90",
          "generations": [
            {
              "id": "ferrari_sf90_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "ferrari_roma",
          "name": "Roma",
          "generations": [
            {
              "id": "ferrari_roma_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "ferrari_portofino",
          "name": "Portofino",
          "generations": [
            {
              "id": "ferrari_portofino_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "fiat",
      "name": "Fiat",
      "models": [
        {
          "id": "fiat_500",
          "name": "500",
          "generations": [
            {
              "id": "fiat_500_gen_3",
              "name": "3rd Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "fiat_panda",
          "name": "Panda",
          "generations": [
            {
              "id": "fiat_panda_gen_4",
              "name": "4th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "fiat_tipo",
          "name": "Tipo",
          "generations": [
            {
              "id": "fiat_tipo_gen_2",
              "name": "2nd Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "ford",
      "name": "Ford",
      "models": [
        {
          "id": "ford_fiesta",
          "name": "Fiesta",
          "generations": [
            {
              "id": "ford_fiesta_gen_8",
              "name": "8th Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "ford_focus",
          "name": "Focus",
          "generations": [
            {
              "id": "ford_focus_gen_4",
              "name": "4th Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "ford_mustang",
          "name": "Mustang",
          "generations": [
            {
              "id": "ford_mustang_gen_6",
              "name": "6th Generation (S650)",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "ford_f150",
          "name": "F-150",
          "generations": [
            {
              "id": "ford_f150_gen_14",
              "name": "14th Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "pickup",
                  "name": "Pickup Truck"
                }
              ]
            }
          ]
        },
        {
          "id": "ford_explorer",
          "name": "Explorer",
          "generations": [
            {
              "id": "ford_explorer_gen_6",
              "name": "6th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "ford_escape",
          "name": "Escape",
          "generations": [
            {
              "id": "ford_escape_gen_4",
              "name": "4th Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "ford_bronco",
          "name": "Bronco",
          "generations": [
            {
              "id": "ford_bronco_gen_6",
              "name": "6th Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "genesis",
      "name": "Genesis",
      "models": [
        {
          "id": "genesis_g70",
          "name": "G70",
          "generations": [
            {
              "id": "genesis_g70_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "genesis_g80",
          "name": "G80",
          "generations": [
            {
              "id": "genesis_g80_gen_2",
              "name": "2nd Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "genesis_g90",
          "name": "G90",
          "generations": [
            {
              "id": "genesis_g90_gen_2",
              "name": "2nd Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "genesis_gv70",
          "name": "GV70",
          "generations": [
            {
              "id": "genesis_gv70_gen_1",
              "name": "1st Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "genesis_gv80",
          "name": "GV80",
          "generations": [
            {
              "id": "genesis_gv80_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "gmc",
      "name": "GMC",
      "models": [
        {
          "id": "gmc_yukon",
          "name": "Yukon",
          "generations": [
            {
              "id": "gmc_yukon_gen_5",
              "name": "5th Generation (GMT K2XX)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "gmc_sierra",
          "name": "Sierra",
          "generations": [
            {
              "id": "gmc_sierra_gen_4",
              "name": "4th Generation (GMT K2XX)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "pickup",
                  "name": "Pickup Truck"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "honda",
      "name": "Honda",
      "models": [
        {
          "id": "honda_civic",
          "name": "Civic",
          "generations": [
            {
              "id": "honda_civic_gen_11",
              "name": "11th Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "honda_accord",
          "name": "Accord",
          "generations": [
            {
              "id": "honda_accord_gen_10",
              "name": "10th Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "honda_cr_v",
          "name": "CR-V",
          "generations": [
            {
              "id": "honda_cr_v_gen_5",
              "name": "5th Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "honda_hr_v",
          "name": "HR-V",
          "generations": [
            {
              "id": "honda_hr_v_gen_2",
              "name": "2nd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "honda_pilot",
          "name": "Pilot",
          "generations": [
            {
              "id": "honda_pilot_gen_4",
              "name": "4th Generation",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "honda_fit",
          "name": "Fit",
          "generations": [
            {
              "id": "honda_fit_gen_4",
              "name": "4th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "hyundai",
      "name": "Hyundai",
      "models": [
        {
          "id": "hyundai_i10",
          "name": "i10",
          "generations": [
            {
              "id": "hyundai_i10_gen_3",
              "name": "3rd Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "hyundai_i20",
          "name": "i20",
          "generations": [
            {
              "id": "hyundai_i20_gen_3",
              "name": "3rd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "hyundai_i30",
          "name": "i30",
          "generations": [
            {
              "id": "hyundai_i30_gen_3",
              "name": "3rd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "hyundai_tucson",
          "name": "Tucson",
          "generations": [
            {
              "id": "hyundai_tucson_gen_4",
              "name": "4th Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "hyundai_santa_fe",
          "name": "Santa Fe",
          "generations": [
            {
              "id": "hyundai_santa_fe_gen_5",
              "name": "5th Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "hyundai_kona",
          "name": "Kona",
          "generations": [
            {
              "id": "hyundai_kona_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "hyundai_ioniq_5",
          "name": "IONIQ 5",
          "generations": [
            {
              "id": "hyundai_ioniq_5_gen_1",
              "name": "1st Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "infiniti",
      "name": "Infiniti",
      "models": [
        {
          "id": "infiniti_q50",
          "name": "Q50",
          "generations": [
            {
              "id": "infiniti_q50_gen_2",
              "name": "2nd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "infiniti_q60",
          "name": "Q60",
          "generations": [
            {
              "id": "infiniti_q60_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "infiniti_qx50",
          "name": "QX50",
          "generations": [
            {
              "id": "infiniti_qx50_gen_2",
              "name": "2nd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "infiniti_qx60",
          "name": "QX60",
          "generations": [
            {
              "id": "infiniti_qx60_gen_2",
              "name": "2nd Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "infiniti_qx80",
          "name": "QX80",
          "generations": [
            {
              "id": "infiniti_qx80_gen_3",
              "name": "3rd Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "jaguar",
      "name": "Jaguar",
      "models": [
        {
          "id": "jaguar_xe",
          "name": "XE",
          "generations": [
            {
              "id": "jaguar_xe_gen_1",
              "name": "1st Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "jaguar_xf",
          "name": "XF",
          "generations": [
            {
              "id": "jaguar_xf_gen_2",
              "name": "2nd Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "jaguar_f_type",
          "name": "F-Type",
          "generations": [
            {
              "id": "jaguar_f_type_gen_1",
              "name": "1st Generation",
              "years": "2013-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "jaguar_f_pace",
          "name": "F-Pace",
          "generations": [
            {
              "id": "jaguar_f_pace_gen_1",
              "name": "1st Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "jaguar_e_pace",
          "name": "E-Pace",
          "generations": [
            {
              "id": "jaguar_e_pace_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "jeep",
      "name": "Jeep",
      "models": [
        {
          "id": "jeep_wrangler",
          "name": "Wrangler",
          "generations": [
            {
              "id": "jeep_wrangler_gen_5",
              "name": "5th Generation (JL)",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "jeep_grand_cherokee",
          "name": "Grand Cherokee",
          "generations": [
            {
              "id": "jeep_grand_cherokee_gen_5",
              "name": "5th Generation (WK2)",
              "years": "2011-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "jeep_compass",
          "name": "Compass",
          "generations": [
            {
              "id": "jeep_compass_gen_3",
              "name": "3rd Generation (MP)",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "jeep_renegade",
          "name": "Renegade",
          "generations": [
            {
              "id": "jeep_renegade_gen_1",
              "name": "1st Generation (BU)",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "jeep_cherokee",
          "name": "Cherokee",
          "generations": [
            {
              "id": "jeep_cherokee_gen_3",
              "name": "3rd Generation (KL)",
              "years": "2014-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "kia",
      "name": "Kia",
      "models": [
        {
          "id": "kia_picanto",
          "name": "Picanto",
          "generations": [
            {
              "id": "kia_picanto_gen_3",
              "name": "3rd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "kia_rio",
          "name": "Rio",
          "generations": [
            {
              "id": "kia_rio_gen_4",
              "name": "4th Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "kia_ceeed",
          "name": "Ceed",
          "generations": [
            {
              "id": "kia_ceeed_gen_3",
              "name": "3rd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "kia_sportage",
          "name": "Sportage",
          "generations": [
            {
              "id": "kia_sportage_gen_5",
              "name": "5th Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "kia_sorento",
          "name": "Sorento",
          "generations": [
            {
              "id": "kia_sorento_gen_4",
              "name": "4th Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "kia_ev6",
          "name": "EV6",
          "generations": [
            {
              "id": "kia_ev6_gen_1",
              "name": "1st Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "lamborghini",
      "name": "Lamborghini",
      "models": [
        {
          "id": "lamborghini_huracan",
          "name": "Huracan",
          "generations": [
            {
              "id": "lamborghini_huracan_gen_1",
              "name": "1st Generation",
              "years": "2014-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "lamborghini_urus",
          "name": "Urus",
          "generations": [
            {
              "id": "lamborghini_urus_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "lamborghini_aventador",
          "name": "Aventador",
          "generations": [
            {
              "id": "lamborghini_aventador_gen_1",
              "name": "1st Generation",
              "years": "2011-2022",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "land_rover",
      "name": "Land Rover",
      "models": [
        {
          "id": "land_rover_defender",
          "name": "Defender",
          "generations": [
            {
              "id": "land_rover_defender_gen_2",
              "name": "2nd Generation (L663)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "land_rover_discovery",
          "name": "Discovery",
          "generations": [
            {
              "id": "land_rover_discovery_gen_5",
              "name": "5th Generation (L462)",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "land_rover_discovery_sport",
          "name": "Discovery Sport",
          "generations": [
            {
              "id": "land_rover_discovery_sport_gen_1",
              "name": "1st Generation (L550)",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "land_rover_range_rover",
          "name": "Range Rover",
          "generations": [
            {
              "id": "land_rover_range_rover_gen_5",
              "name": "5th Generation (L405)",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "land_rover_range_rover_sport",
          "name": "Range Rover Sport",
          "generations": [
            {
              "id": "land_rover_range_rover_sport_gen_3",
              "name": "3rd Generation (L494)",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "land_rover_range_rover_evoque",
          "name": "Range Rover Evoque",
          "generations": [
            {
              "id": "land_rover_range_rover_evoque_gen_2",
              "name": "2nd Generation (L551)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "lexus",
      "name": "Lexus",
      "models": [
        {
          "id": "lexus_is",
          "name": "IS",
          "generations": [
            {
              "id": "lexus_is_gen_3",
              "name": "3rd Generation (XE30)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "lexus_es",
          "name": "ES",
          "generations": [
            {
              "id": "lexus_es_gen_7",
              "name": "7th Generation (XZ10)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "lexus_ls",
          "name": "LS",
          "generations": [
            {
              "id": "lexus_ls_gen_5",
              "name": "5th Generation (XF50)",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "lexus_rx",
          "name": "RX",
          "generations": [
            {
              "id": "lexus_rx_gen_5",
              "name": "5th Generation (AL20)",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "lexus_nx",
          "name": "NX",
          "generations": [
            {
              "id": "lexus_nx_gen_2",
              "name": "2nd Generation (AZ20)",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "lexus_ux",
          "name": "UX",
          "generations": [
            {
              "id": "lexus_ux_gen_1",
              "name": "1st Generation (ZA10)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "maserati",
      "name": "Maserati",
      "models": [
        {
          "id": "maserati_ghibli",
          "name": "Ghibli",
          "generations": [
            {
              "id": "maserati_ghibli_gen_2",
              "name": "2nd Generation",
              "years": "2014-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "maserati_levante",
          "name": "Levante",
          "generations": [
            {
              "id": "maserati_levante_gen_1",
              "name": "1st Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "maserati_quattroporte",
          "name": "Quattroporte",
          "generations": [
            {
              "id": "maserati_quattroporte_gen_6",
              "name": "6th Generation",
              "years": "2013-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mazda",
      "name": "Mazda",
      "models": [
        {
          "id": "mazda_mazda3",
          "name": "Mazda3",
          "generations": [
            {
              "id": "mazda_mazda3_gen_4",
              "name": "4th Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "mazda_mazda6",
          "name": "Mazda6",
          "generations": [
            {
              "id": "mazda_mazda6_gen_3",
              "name": "3rd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "mazda_cx_5",
          "name": "CX-5",
          "generations": [
            {
              "id": "mazda_cx_5_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mazda_cx_9",
          "name": "CX-9",
          "generations": [
            {
              "id": "mazda_cx_9_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mazda_mx_5",
          "name": "MX-5",
          "generations": [
            {
              "id": "mazda_mx_5_gen_4",
              "name": "4th Generation (ND)",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mclaren",
      "name": "McLaren",
      "models": [
        {
          "id": "mclaren_720s",
          "name": "720S",
          "generations": [
            {
              "id": "mclaren_720s_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "mclaren_artura",
          "name": "Artura",
          "generations": [
            {
              "id": "mclaren_artura_gen_1",
              "name": "1st Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        },
        {
          "id": "mclaren_gt",
          "name": "GT",
          "generations": [
            {
              "id": "mclaren_gt_gen_1",
              "name": "1st Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mercedes_benz",
      "name": "Mercedes-Benz",
      "models": [
        {
          "id": "mercedes_benz_a_class",
          "name": "A-Class",
          "generations": [
            {
              "id": "mercedes_benz_a_class_gen_4",
              "name": "4th Generation (W177)",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_c_class",
          "name": "C-Class",
          "generations": [
            {
              "id": "mercedes_benz_c_class_gen_5",
              "name": "5th Generation (W206)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_e_class",
          "name": "E-Class",
          "generations": [
            {
              "id": "mercedes_benz_e_class_gen_5",
              "name": "5th Generation (W213)",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_s_class",
          "name": "S-Class",
          "generations": [
            {
              "id": "mercedes_benz_s_class_gen_7",
              "name": "7th Generation (W223)",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_gla",
          "name": "GLA",
          "generations": [
            {
              "id": "mercedes_benz_gla_gen_2",
              "name": "2nd Generation (H247)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_glc",
          "name": "GLC",
          "generations": [
            {
              "id": "mercedes_benz_glc_gen_2",
              "name": "2nd Generation (X253)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_gle",
          "name": "GLE",
          "generations": [
            {
              "id": "mercedes_benz_gle_gen_2",
              "name": "2nd Generation (W167)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_gls",
          "name": "GLS",
          "generations": [
            {
              "id": "mercedes_benz_gls_gen_2",
              "name": "2nd Generation (X167)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_g_wagon",
          "name": "G-Wagon",
          "generations": [
            {
              "id": "mercedes_benz_g_wagon_gen_2",
              "name": "2nd Generation (W463)",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mercedes_benz_amg_gt",
          "name": "AMG GT",
          "generations": [
            {
              "id": "mercedes_benz_amg_gt_gen_1",
              "name": "1st Generation (C190)",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mini",
      "name": "Mini",
      "models": [
        {
          "id": "mini_cooper",
          "name": "Cooper",
          "generations": [
            {
              "id": "mini_cooper_gen_3",
              "name": "3rd Generation (F56)",
              "years": "2014-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "mini_cooper_s",
          "name": "Cooper S",
          "generations": [
            {
              "id": "mini_cooper_s_gen_3",
              "name": "3rd Generation (F56)",
              "years": "2014-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "mini_john_cooper_works",
          "name": "John Cooper Works",
          "generations": [
            {
              "id": "mini_john_cooper_works_gen_3",
              "name": "3rd Generation (F56)",
              "years": "2014-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "mitsubishi",
      "name": "Mitsubishi",
      "models": [
        {
          "id": "mitsubishi_outlander",
          "name": "Outlander",
          "generations": [
            {
              "id": "mitsubishi_outlander_gen_4",
              "name": "4th Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "mitsubishi_eclipse_cross",
          "name": "Eclipse Cross",
          "generations": [
            {
              "id": "mitsubishi_eclipse_cross_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "nissan",
      "name": "Nissan",
      "models": [
        {
          "id": "nissan_qashqai",
          "name": "Qashqai",
          "generations": [
            {
              "id": "nissan_qashqai_gen_3",
              "name": "3rd Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "nissan_juke",
          "name": "Juke",
          "generations": [
            {
              "id": "nissan_juke_gen_2",
              "name": "2nd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "nissan_leaf",
          "name": "Leaf",
          "generations": [
            {
              "id": "nissan_leaf_gen_2",
              "name": "2nd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "nissan_gt_r",
          "name": "GT-R",
          "generations": [
            {
              "id": "nissan_gt_r_gen_3",
              "name": "3rd Generation (R35)",
              "years": "2009-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "peugeot",
      "name": "Peugeot",
      "models": [
        {
          "id": "peugeot_208",
          "name": "208",
          "generations": [
            {
              "id": "peugeot_208_gen_3",
              "name": "3rd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "peugeot_3008",
          "name": "3008",
          "generations": [
            {
              "id": "peugeot_3008_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "peugeot_5008",
          "name": "5008",
          "generations": [
            {
              "id": "peugeot_5008_gen_2",
              "name": "2nd Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "porsche",
      "name": "Porsche",
      "models": [
        {
          "id": "porsche_911",
          "name": "911",
          "generations": [
            {
              "id": "porsche_911_gen_8",
              "name": "8th Generation (992)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "coupe",
                  "name": "Coupe"
                },
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "porsche_cayenne",
          "name": "Cayenne",
          "generations": [
            {
              "id": "porsche_cayenne_gen_3",
              "name": "3rd Generation (9YA)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "porsche_macan",
          "name": "Macan",
          "generations": [
            {
              "id": "porsche_macan_gen_2",
              "name": "2nd Generation (95B)",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "porsche_panamera",
          "name": "Panamera",
          "generations": [
            {
              "id": "porsche_panamera_gen_2",
              "name": "2nd Generation (971)",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "porsche_taycan",
          "name": "Taycan",
          "generations": [
            {
              "id": "porsche_taycan_gen_1",
              "name": "1st Generation (J1)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "renault",
      "name": "Renault",
      "models": [
        {
          "id": "renault_clio",
          "name": "Clio",
          "generations": [
            {
              "id": "renault_clio_gen_5",
              "name": "5th Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "renault_megane",
          "name": "Megane",
          "generations": [
            {
              "id": "renault_megane_gen_4",
              "name": "4th Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "renault_captur",
          "name": "Captur",
          "generations": [
            {
              "id": "renault_captur_gen_2",
              "name": "2nd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "rolls_royce",
      "name": "Rolls-Royce",
      "models": [
        {
          "id": "rolls_royce_ghost",
          "name": "Ghost",
          "generations": [
            {
              "id": "rolls_royce_ghost_gen_2",
              "name": "2nd Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "rolls_royce_dawn",
          "name": "Dawn",
          "generations": [
            {
              "id": "rolls_royce_dawn_gen_1",
              "name": "1st Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "convertible",
                  "name": "Convertible"
                }
              ]
            }
          ]
        },
        {
          "id": "rolls_royce_cullinan",
          "name": "Cullinan",
          "generations": [
            {
              "id": "rolls_royce_cullinan_gen_1",
              "name": "1st Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "skoda",
      "name": "Škoda",
      "models": [
        {
          "id": "skoda_fabia",
          "name": "Fabia",
          "generations": [
            {
              "id": "skoda_fabia_gen_4",
              "name": "4th Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "skoda_octavia",
          "name": "Octavia",
          "generations": [
            {
              "id": "skoda_octavia_gen_4",
              "name": "4th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "liftback",
                  "name": "Liftback"
                }
              ]
            }
          ]
        },
        {
          "id": "skoda_kodiaq",
          "name": "Kodiaq",
          "generations": [
            {
              "id": "skoda_kodiaq_gen_1",
              "name": "1st Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "skoda_kamiq",
          "name": "Kamiq",
          "generations": [
            {
              "id": "skoda_kamiq_gen_1",
              "name": "1st Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "subaru",
      "name": "Subaru",
      "models": [
        {
          "id": "subaru_impreza",
          "name": "Impreza",
          "generations": [
            {
              "id": "subaru_impreza_gen_5",
              "name": "5th Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "subaru_forester",
          "name": "Forester",
          "generations": [
            {
              "id": "subaru_forester_gen_6",
              "name": "6th Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "subaru_outback",
          "name": "Outback",
          "generations": [
            {
              "id": "subaru_outback_gen_6",
              "name": "6th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "wagon",
                  "name": "Wagon"
                }
              ]
            }
          ]
        },
        {
          "id": "subaru_xv",
          "name": "XV",
          "generations": [
            {
              "id": "subaru_xv_gen_2",
              "name": "2nd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "suzuki",
      "name": "Suzuki",
      "models": [
        {
          "id": "suzuki_swift",
          "name": "Swift",
          "generations": [
            {
              "id": "suzuki_swift_gen_5",
              "name": "5th Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "suzuki_vitara",
          "name": "Vitara",
          "generations": [
            {
              "id": "suzuki_vitara_gen_2",
              "name": "2nd Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "tesla",
      "name": "Tesla",
      "models": [
        {
          "id": "tesla_model_3",
          "name": "Model 3",
          "generations": [
            {
              "id": "tesla_model_3_gen_1",
              "name": "1st Generation",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "tesla_model_y",
          "name": "Model Y",
          "generations": [
            {
              "id": "tesla_model_y_gen_1",
              "name": "1st Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "tesla_model_s",
          "name": "Model S",
          "generations": [
            {
              "id": "tesla_model_s_gen_2",
              "name": "2nd Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "tesla_model_x",
          "name": "Model X",
          "generations": [
            {
              "id": "tesla_model_x_gen_2",
              "name": "2nd Generation",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "toyota",
      "name": "Toyota",
      "models": [
        {
          "id": "toyota_corolla",
          "name": "Corolla",
          "generations": [
            {
              "id": "toyota_corolla_gen_12",
              "name": "12th Generation (E210)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                },
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "toyota_camry",
          "name": "Camry",
          "generations": [
            {
              "id": "toyota_camry_gen_8",
              "name": "8th Generation (XV70)",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "toyota_rav4",
          "name": "RAV4",
          "generations": [
            {
              "id": "toyota_rav4_gen_5",
              "name": "5th Generation (XA50)",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "toyota_highlander",
          "name": "Highlander",
          "generations": [
            {
              "id": "toyota_highlander_gen_4",
              "name": "4th Generation (XU70)",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "toyota_prius",
          "name": "Prius",
          "generations": [
            {
              "id": "toyota_prius_gen_5",
              "name": "5th Generation (XW60)",
              "years": "2023-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "toyota_c_hr",
          "name": "C-HR",
          "generations": [
            {
              "id": "toyota_c_hr_gen_1",
              "name": "1st Generation (AX10)",
              "years": "2017-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "toyota_land_cruiser",
          "name": "Land Cruiser",
          "generations": [
            {
              "id": "toyota_land_cruiser_gen_3",
              "name": "3rd Generation (J300)",
              "years": "2022-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "volkswagen",
      "name": "Volkswagen",
      "models": [
        {
          "id": "volkswagen_golf",
          "name": "Golf",
          "generations": [
            {
              "id": "volkswagen_golf_gen_8",
              "name": "8th Generation",
              "years": "2020-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "volkswagen_passat",
          "name": "Passat",
          "generations": [
            {
              "id": "volkswagen_passat_gen_8",
              "name": "8th Generation (B8)",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "volkswagen_polo",
          "name": "Polo",
          "generations": [
            {
              "id": "volkswagen_polo_gen_6",
              "name": "6th Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "hatchback",
                  "name": "Hatchback"
                }
              ]
            }
          ]
        },
        {
          "id": "volkswagen_tiguan",
          "name": "Tiguan",
          "generations": [
            {
              "id": "volkswagen_tiguan_gen_2",
              "name": "2nd Generation",
              "years": "2016-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "volkswagen_touareg",
          "name": "Touareg",
          "generations": [
            {
              "id": "volkswagen_touareg_gen_3",
              "name": "3rd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "volkswagen_id_4",
          "name": "ID.4",
          "generations": [
            {
              "id": "volkswagen_id_4_gen_1",
              "name": "1st Generation",
              "years": "2021-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "volvo",
      "name": "Volvo",
      "models": [
        {
          "id": "volvo_xc40",
          "name": "XC40",
          "generations": [
            {
              "id": "volvo_xc40_gen_1",
              "name": "1st Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "volvo_xc60",
          "name": "XC60",
          "generations": [
            {
              "id": "volvo_xc60_gen_2",
              "name": "2nd Generation",
              "years": "2018-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "volvo_xc90",
          "name": "XC90",
          "generations": [
            {
              "id": "volvo_xc90_gen_2",
              "name": "2nd Generation",
              "years": "2015-2025",
              "bodyStyles": [
                {
                  "id": "suv",
                  "name": "SUV"
                }
              ]
            }
          ]
        },
        {
          "id": "volvo_s60",
          "name": "S60",
          "generations": [
            {
              "id": "volvo_s60_gen_3",
              "name": "3rd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "sedan",
                  "name": "Sedan"
                }
              ]
            }
          ]
        },
        {
          "id": "volvo_v60",
          "name": "V60",
          "generations": [
            {
              "id": "volvo_v60_gen_2",
              "name": "2nd Generation",
              "years": "2019-2025",
              "bodyStyles": [
                {
                  "id": "wagon",
                  "name": "Wagon"
                }
              ]
            }
          ]
        }
      ]
    }
  ];
  
  // (Comment removed - was in Arabic)
  export const getAllMakes = (): { id: string; name: string }[] => {
    return CAR_DATA.map(make => ({
      id: make.id,
      name: make.name
    }));
  };
  
  export const getModelsByMake = (makeId: string): { id: string; name: string }[] => {
    const make = CAR_DATA.find(m => m.id === makeId);
    if (!make) return [];
    return make.models.map(model => ({
      id: model.id,
      name: model.name
    }));
  };
  
  export const getGenerationsByModel = (makeId: string, modelId: string): { id: string; name: string; years: string }[] => {
    const make = CAR_DATA.find(m => m.id === makeId);
    if (!make) return [];
    const model = make.models.find(m => m.id === modelId);
    if (!model) return [];
    return model.generations.map(gen => ({
      id: gen.id,
      name: gen.name,
      years: gen.years
    }));
  };
  
  export const getBodyStylesByGeneration = (makeId: string, modelId: string, generationId: string): { id: string; name: string }[] => {
    const make = CAR_DATA.find(m => m.id === makeId);
    if (!make) return [];
    const model = make.models.find(m => m.id === modelId);
    if (!model) return [];
    const generation = model.generations.find(g => g.id === generationId);
    if (!generation) return [];
    return generation.bodyStyles;
  };
  
  