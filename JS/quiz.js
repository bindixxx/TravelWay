/* ================== СИНХРОНИЗАЦИЯ ТЕМЫ ================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    document.documentElement.classList.remove("dark");
    themeToggle.checked = false;
    themeIcon.textContent = "☀️";
} else {
    document.documentElement.classList.add("dark");
    themeToggle.checked = true;
    themeIcon.textContent = "🌙";
}

themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
        themeIcon.textContent = "🌙";
    } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
        themeIcon.textContent = "☀️";
    }
});

/* ================== КВИЗ ================== */

const backBtn = document.getElementById('backBtn');
backBtn.addEventListener('click', () => {
  window.location.href = 'main.html';
});

const quizQuestions = document.querySelectorAll('.question-card');
const progressFill = document.getElementById('progressFill');
const resultsContainer = document.getElementById('resultsContainer');
const recommendedPlaces = document.getElementById('recommendedPlaces');

const places = {
  beach:{
    id:1,
    emoji:"🌊",
    title:"Бакинское побережье",
    desc:"Закаты над Каспием, современные набережные и уютные кафе с видом на море",
    img:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    tags:["beach","relaxation","summer","couple","family","comfort","luxury"]
  },
  nature:{
    id:2,
    emoji:"⛰️",
    title:"Горные вершины",
    desc:"Маршруты всех уровней, панорамные виды и свежий горный воздух",
    img:"https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    tags:["nature","hiking","spring-autumn","solo","friends","comfort"]
  },
  biking:{
    id:3,
    emoji:"🚶‍➡️",
    title:"Велопрогулки",
    desc:"Места которые обеспечат езду на велосипеде",
    img:"https://encrypted-tbn2.gstatic.com/licensed-image?q=tbn:ANd9GcRR0CcyEX_FOMwbNrDbXkW7nIg0O9fQfs-fEnp_cUHoq9mP1x5LdcG74gcQ0kaBz-onEbT_99JSLIPtXhjX4Nd9rD0vWAoF5CXBhmbWblLi7hqhBH4",
    tags:["nature","hiking","spring-autumn","solo","friends","comfort"]
  },
  forest:{
    id:4,
    emoji:"🌲",
    title:"Лесное убежище",
    desc:"Домики, тропы и отдых у реки среди природы",
    img:"https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
    tags:["nature","relaxation","spring-autumn","family","couple","comfort"]
  },
  city:{
    id:5,
    emoji:"🏛️",
    title:"Городская культура",
    desc:"Музеи, кафе и продуманные пешеходные маршруты",
    img:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800",
    tags:["city","culture","anytime","solo","couple","comfort","luxury"]
  },
  luxury_beach:{
    id:6,
    emoji:"🏝️",
    title:"Островной отдых",
    desc:"Частные пляжи и роскошь босиком",
    img:"https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    tags:["beach","relaxation","summer","couple","luxury"]
  },
  food:{
    id:7,
    emoji:"🍽️",
    title:"Кулинарный тур",
    desc:"Местные вкусы и дегустации от шеф-поваров",
    img:"https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    tags:["city","food","anytime","couple","friends","comfort","luxury"]
  },
  art:{
    id:8,
    emoji:"🎨",
    title:"Арт-галереи",
    desc:"Современное искусство и культурные пространства",
    img:"https://million-wallpapers.ru/wallpapers/3/78/475037882443469/vektornaya-grafika-i-iskусство-mира.jpg",
    tags:["city","culture","anytime","solo","couple","comfort"]
  },
  extreme:{
    id:10,
    emoji:"⚡",
    title:"Экстремальные походы",
    desc:"Адреналин, резкие подъёмы, склоны и уступы",
    img:"https://ahvgorah.com/uploads/2025/11/kakie-vidy-ekstremal-nogo-turizma-susestvuut-i-cem-oni-otlicautsa.webp",
    tags:["extreme","hiking","spring-autumn","summer","solo","friends","comfort"]
  },
  lakes:{
    id:11,
    emoji:"💧",
    title:"Спокойные водоёмы",
    desc:"Зеркальная гладь воды, тишина и чистый воздух",
    img:"https://images.wallpaperscraft.ru/image/single/ozero_gory_les_152659_3840x2400.jpg",
    tags:["nature","relaxation","summer","spring-autumn","family","couple","comfort"]
  },
  history:{
    id:12,
    emoji:"🏺",
    title:"Исторические тропы",
    desc:"Древние крепости, сёла и культурные места",
    img:"https://cheapfortrip.com/blog/app/uploads/2022/08/image_processing20181012-4-ly5kv5.jpg",
    tags:["city","culture","anytime","solo","couple","family","comfort"]
  },
  winter:{
    id:14,
    emoji:"❄️",
    title:"Зимние маршруты",
    desc:"Снежные тропы, морозный воздух и панорамы",
    img:"https://99px.ru/sstorage/53/2023/01/tmb_348232_911386.jpg",
    tags:["nature","hiking","winter","solo","friends","comfort"]
  },
  night:{
    id:15,
    emoji:"🌌",
    title:"Ночные походы",
    desc:"Звёзды, тьма, романтика и прохлада",
    img:"https://image.fonwall.ru/o/gz/galaxy-microsoft-windows-night-tents.jpeg?auto=compress&fit=crop&w=2560&h=1440",
    tags:["nature","hiking","anytime","couple","friends","comfort"]
  },
  camping:{
    id:16,
    emoji:"⛺",
    title:"Кемпинговые зоны",
    desc:"Можно поставить палатку и провести ночь под звёздами",
    img:"https://img.today.travel/insecure/rs:fill:1496:658/czM6Ly9wdWJsaWMvYmxvZ19wb3N0cy9KaC9aOS9kVC9KaFo5ZFQ3YjV5UUZyVWRaZGdlVi53ZWJw",
    tags:["nature","hiking","summer","spring-autumn","friends","solo","comfort"]
  }
};

let answers = {};

quizQuestions.forEach(card => {
  card.querySelectorAll('.answer-option').forEach(option => {
    option.addEventListener('click', () => {

      const q = card.dataset.question;

      if(q == '0' && option.dataset.answer === 'no'){
        window.location.href = 'main.html';
        return;
      }

      answers[q] = option.dataset.value;

      card.classList.add('hidden');
      const next = parseInt(q) + 1;
      if(next < quizQuestions.length){
        quizQuestions[next].classList.remove('hidden');
        progressFill.style.width = (next / (quizQuestions.length -1) * 100) + '%';
      } else {
        showResults();
      }
    });
  });
});

function showResults(){
    const userTags = [];
    for(let i = 1; i <= 5; i++){
        if(answers[i]) userTags.push(answers[i]);
    }
    const scores = {};
    Object.values(places).forEach(place => {
        let score = 0;
        userTags.forEach(tag => {
            if(place.tags.includes(tag)){
                score++;
            }
        });
        if(score > 0){
            scores[place.id] = score;
        }
    });

    let topPlaces = [];
    if(Object.keys(scores).length === 0){
        const allPlaces = Object.values(places);
        topPlaces = [
            allPlaces[0],
            allPlaces[1],
            allPlaces[2]
        ];
    } else {
        const sorted = Object.entries(scores)
            .sort((a,b) => b[1] - a[1])
            .slice(0, 3);
        
        topPlaces = sorted.map(([placeId]) => 
            Object.values(places).find(p => p.id == placeId)
        );
    }

    const mainPlace = topPlaces[0];
    document.getElementById('resultEmoji').textContent = mainPlace.emoji;
    document.getElementById('resultTitle').textContent = mainPlace.title;
    document.getElementById('resultSubtitle').textContent = 'На основе ваших ответов мы подобрали для вас лучшие варианты:';

    recommendedPlaces.innerHTML = topPlaces.map(place => `
        <div class="place-card">
            <div class="place-media" style="background-image:url('${place.img}')"></div>
            <div class="place-overlay">
                <span class="place-badge">${place.emoji}</span>
                <h3 class="place-title">${place.title}</h3>
                <p class="place-description">${place.desc}</p>
                <div class="place-footer">
                    <div class="place-rating">⭐ Рекомендуем</div>
                </div>
            </div>
        </div>
    `).join('');
    document.getElementById('quizQuestions').style.display = 'none';
    resultsContainer.classList.add('show');
    progressFill.style.width = '100%';
}