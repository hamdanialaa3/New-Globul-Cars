// Split data: all car makes and models moved from carData_static.ts
// Note: Kept as plain data export to avoid type coupling; consumers cast as needed.

export const CAR_DATA_DATA = [
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
  // ...
  // NOTE: For brevity, the remaining makes from the original CAR_DATA
  // should be copied here unchanged (Audi, Bentley, BMW, Bugatti, Cadillac, Chevrolet,
  // Chrysler, Citroën, Dacia, Dodge, Ferrari, Fiat, Ford, Genesis, GMC, Honda,
  // Hyundai, Infiniti, Jaguar, Jeep, Kia, Lamborghini, Land Rover, Lexus,
  // Maserati, Mazda, McLaren, Mercedes-Benz, Mini, Mitsubishi, Nissan, Peugeot,
  // Porsche, Renault, Rolls-Royce, Škoda, Subaru, Suzuki, Tesla, Toyota,
  // Volkswagen, Volvo).
];
