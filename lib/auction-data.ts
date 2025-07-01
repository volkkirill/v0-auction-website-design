// lib/auction-data.ts
export const auctionHouses = [
  {
    id: "ah1",
    name: "Галерея Искусств",
    logo: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Ведущий аукционный дом по продаже произведений искусства.",
    contactEmail: "info@artgallery.com",
    phone: "+7 (495) 123-45-67",
    address: "Москва, ул. Тверская, 10",
    website: "https://www.artgallery.com",
  },
  {
    id: "ah2",
    name: "Коллекционер Монет",
    logo: "https://images.unsplash.com/photo-1621259181811-912222759797?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Специализируется на редких и исторических монетах.",
    contactEmail: "coins@collector.ru",
    phone: "+7 (495) 987-65-43",
    address: "Санкт-Петербург, Невский пр., 25",
    website: "https://www.coincollector.ru",
  },
  {
    id: "ah3",
    name: "Автомобильный Клуб",
    logo: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Эксперты в области винтажных и классических автомобилей.",
    contactEmail: "auto@club.ru",
    phone: "+7 (812) 111-22-33",
    address: "Казань, ул. Баумана, 50",
    website: "https://www.autoclub.ru",
  },
  {
    id: "ah4",
    name: "Ювелирный Дом",
    logo: "https://images.unsplash.com/photo-1589674473791-122f0423127a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Изысканные украшения и драгоценные камни.",
    contactEmail: "jewelry@house.ru",
    phone: "+7 (343) 444-55-66",
    address: "Екатеринбург, пр. Ленина, 15",
    website: "https://www.jewelryhouse.ru",
  },
  {
    id: "ah5",
    name: "Антикварный Салон",
    logo: "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    description: "Редкие предметы старины и коллекционные вещи.",
    contactEmail: "antique@salon.ru",
    phone: "+7 (383) 777-88-99",
    address: "Новосибирск, Красный пр., 70",
    website: "https://www.antiquesalon.ru",
  },
]

export const allAuctions = [
  {
    id: "1",
    title: "Аукцион классического искусства",
    description: "Коллекция произведений искусства от известных мастеров.",
    startTime: "2025-07-01T10:00:00Z",
    status: "active",
    category: "Искусство",
    auctionHouseId: "ah1",
    image:
      "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "2",
    title: "Аукцион редких монет",
    description: "Уникальные монеты со всего мира, включая античные и современные.",
    startTime: "2025-07-02T14:30:00Z",
    status: "upcoming",
    category: "Коллекционирование",
    auctionHouseId: "ah2",
    image:
      "https://images.unsplash.com/photo-1621259181811-912222759797?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "3",
    title: "Аукцион винтажных автомобилей",
    description: "Классические автомобили для коллекционеров и энтузиастов.",
    startTime: "2025-07-03T09:00:00Z",
    status: "upcoming",
    category: "Автомобили",
    auctionHouseId: "ah3",
    image:
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "4",
    title: "Аукцион ювелирных изделий",
    description: "Изысканные украшения и драгоценные камни.",
    startTime: "2025-07-04T16:00:00Z",
    status: "closed",
    category: "Ювелирные изделия",
    auctionHouseId: "ah4",
    image:
      "https://images.unsplash.com/photo-1589674473791-122f0423127a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "5",
    title: "Аукцион антикварной мебели",
    description: "Редкие предметы мебели различных эпох.",
    startTime: "2025-07-05T11:45:00Z",
    status: "active",
    category: "Антиквариат",
    auctionHouseId: "ah5",
    image:
      "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "6",
    title: "Аукцион современной фотографии",
    description: "Работы известных и начинающих фотографов.",
    startTime: "2025-07-06T13:00:00Z",
    status: "upcoming",
    category: "Искусство",
    auctionHouseId: "ah1",
    image:
      "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "7",
    title: "Аукцион редких книг и рукописей",
    description: "Коллекция старинных книг, манускриптов и автографов.",
    startTime: "2025-07-07T10:00:00Z",
    status: "upcoming",
    category: "Коллекционирование",
    auctionHouseId: "ah5",
    image:
      "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "8",
    title: "Аукцион вин и спиртных напитков",
    description: "Изысканные вина и редкие спиртные напитки со всего мира.",
    startTime: "2025-07-08T18:00:00Z",
    status: "active",
    category: "Коллекционирование",
    auctionHouseId: "ah2",
    image:
      "https://images.unsplash.com/photo-1582139329536-e7261d679248?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "9",
    title: "Аукцион современного дизайна",
    description: "Предметы интерьера и мебель от ведущих дизайнеров.",
    startTime: "2025-07-09T14:00:00Z",
    status: "upcoming",
    category: "Искусство",
    auctionHouseId: "ah1",
    image:
      "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "10",
    title: "Аукцион редких марок и открыток",
    description: "Коллекции филателии и нумизматики.",
    startTime: "2025-07-10T11:00:00Z",
    status: "active",
    category: "Коллекционирование",
    auctionHouseId: "ah2",
    image:
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
]

export const images = {
  heroBg:
    "https://images.unsplash.com/photo-1517430816045-df4b7de11679?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  artPainting:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rareCoin:
    "https://images.unsplash.com/photo-1621259181811-912222759797?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  vintageCar:
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  diamondJewelry:
    "https://images.unsplash.com/photo-1589674473791-122f0423127a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  antiqueBook:
    "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  modernSculpture:
    "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  luxuryWatch:
    "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  fineWine:
    "https://images.unsplash.com/photo-1582139329536-e7261d679248?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  stampCollection:
    "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  landscapePainting:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  rareOldBook:
    "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  silverTeaSet:
    "https://images.unsplash.com/photo-1582139329536-e7261d679248?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  springArtAuction:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  modernPhotographyAuction:
    "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  winterAntiquesAuction:
    "https://images.unsplash.com/photo-1532012195217-55682ed9e960?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  autumnJewelryAuction:
    "https://images.unsplash.com/photo-1589674473791-122f0423127a?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  bronzeStatuette:
    "https://images.unsplash.com/photo-1599623560574-29c21482b3bc?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  vinylRecords:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  mingVaseMain:
    "https://images.unsplash.com/photo-1578301978018-3005759f48f7?q=80&w=1935&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  harleyDavidsonMotorcycle:
    "https://images.unsplash.com/photo-1558981403-c5e311223378?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  patekPhilippePocket:
    "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  audemarsPiguetModern:
    "https://images.unsplash.com/photo-1622434641406-a1581234509c?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
}
