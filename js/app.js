const pages = Array.from(document.querySelectorAll('.page'));
    const navItems = Array.from(document.querySelectorAll('.nav-item'));
    

    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    }

    document.querySelectorAll('.chips').forEach(group => {
      group.addEventListener('click', e => {
        if (!e.target.classList.contains('chip')) return;
        if (group.dataset.group !== 'interest') {
          group.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
        }
        e.target.classList.toggle('active');
        syncPreferenceState();
      });
    });

    function syncPreferenceState() {
      const play = document.querySelector('[data-group="play"] .chip.active');
      const mode = document.querySelector('[data-group="mode"] .chip.active');
      const interests = Array.from(document.querySelectorAll('[data-group="interest"] .chip.active')).map(item => item.textContent);
      state.play = play ? play.textContent : '轻松逛';
      state.mode = mode ? mode.textContent : '简短版';
      state.interest = interests.length ? interests : ['古建筑'];
      updatePreferenceSummary();
    }

    function updatePreferenceSummary() {
      const summary = document.getElementById('prefSummary');
      if (!summary) return;
      summary.innerHTML = `
        <div class="summary-row"><span>玩法</span><b>${state.play}</b></div>
        <div class="summary-row"><span>兴趣</span><b>${state.interest.join(' · ')}</b></div>
        <div class="summary-row"><span>讲解</span><b>${state.mode}</b></div>
      `;
    }

    function goPage(index) {
      current = Math.max(0, Math.min(pages.length - 1, index));
      pages.forEach((page, i) => page.classList.toggle('active', i === current));
      const tab = pages[current].dataset.tab;
      navItems.forEach(item => item.classList.toggle('active', item.dataset.tab === tab));
      if (current === 1) syncPreferenceState();
      if (current === 2) updateRouteSummary();
      if (current === 4) updateGuideByState();
    }

    function startJourney() {
      const btn = document.getElementById('startBtn');
      const continueBtn = document.getElementById('continueBtn');
      const hint = document.getElementById('startHint');
      btn.classList.add('loading');
      btn.textContent = '小衡准备中';
      hint.classList.add('loading');
      hint.querySelector('span:last-child').textContent = '正在打开偏好问卷与路线引擎……';
      setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = '重新出发';
        btn.classList.remove('primary');
        btn.classList.add('secondary');

        continueBtn.style.display = 'block';

        hint.classList.remove('loading');
        hint.querySelector('span:last-child').textContent = '可开启新路线，或直接继续寻迹';
        goPage(1);
        showToast('小衡已上线，先选 3 个偏好吧');
      }, 850);
    }

    function continueJourney() {
      goPage(4);
      simulateLocation();
    }

    function generateRoutes() {
      syncPreferenceState();
      const btn = document.getElementById('recommendBtn');
      btn.classList.add('loading');
      btn.textContent = '路线生成中';
      setTimeout(() => {
        btn.classList.remove('loading');
        btn.textContent = '重新生成路线推荐';
        goPage(2);
        showToast('已按你的偏好重新排序路线');
      }, 900);
    }

    function updateRouteSummary() {
      const summary = document.getElementById('routeSummary');
      if (!summary) return;
      summary.innerHTML = `小衡判断你偏向 <b>${state.play}</b>，关注 <b>${state.interest.join(' · ')}</b>，推荐优先体验“${state.route}”。`;
    }

    function selectRoute(card) {
      document.querySelectorAll('.route-card').forEach(item => item.classList.remove('selected'));
      card.classList.add('selected');
      state.route = card.dataset.route;
      state.sites = card.dataset.sites;
      updateRouteSummary();
      showToast(`已选择「${state.route}」，小衡开始定位`);
      setTimeout(() => {
        goPage(4);
        simulateLocation();
      }, 700);
    }

    function simulateLocation() {
      const status = document.getElementById('locationStatus');
      const map = document.getElementById('mapCard');
      const label = document.getElementById('mapLabel');
      const container = document.getElementById('nearbySpotsContainer');
      const chipsBox = document.getElementById('nearbyChips');

      status.textContent = '正在获取真实地理位置……';
      map.dataset.status = 'GPS 请求中 · 等待授权';
      label.textContent = '定位中...';
      container.style.display = 'none';

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;

          const sortedSpots = spotsData.map(spot => ({
            ...spot,
            distance: getDistance(userLat, userLng, spot.lat, spot.lng)
          })).sort((a, b) => a.distance - b.distance);

          const nearbySpots = sortedSpots.slice(0, 3);
          state.matchedSpot = nearbySpots[0];

          status.textContent = `定位成功！发现附近 ${nearbySpots.length} 个核心景点`;
          map.dataset.status = 'GPS 已定位 · 附近景点已识别';
          label.textContent = `当前讲解：${state.matchedSpot.name}`;

          container.style.display = 'block';
          chipsBox.innerHTML = nearbySpots.map((spot, index) => {
            return `<button class="chip ${index === 0 ? 'active' : ''}" onclick="selectSpot(this, '${spot.name}')">${spot.name} <span style="font-size:11px;opacity:0.75">(${spot.distance.toFixed(1)}km)</span></button>`;
          }).join('');

          updateGuideByState();

        }, error => {
          console.warn("GPS failed, using fallback:", error);
          fallbackLocation(status, map, label, container);
        }, { timeout: 8000 });
      } else {
        fallbackLocation(status, map, label, container);
      }
    }

    function fallbackLocation(status, map, label, container) {
      status.textContent = `定位失败或未授权，已开启默认演示模式。`;
      map.dataset.status = '模拟定位 · 演示数据';

      const defaultSpots = spotsData.slice(3, 6); // 景山、故宫、太庙
      state.matchedSpot = defaultSpots[0];
      label.textContent = `当前讲解：${state.matchedSpot.name}`;

      container.style.display = 'block';
      document.getElementById('nearbyChips').innerHTML = defaultSpots.map((spot, index) => {
        return `<button class="chip ${index === 0 ? 'active' : ''}" onclick="selectSpot(this, '${spot.name}')">${spot.name}</button>`;
      }).join('');

      updateGuideByState();
    }

    function selectSpot(btn, spotName) {
      document.querySelectorAll('#nearbyChips .chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      state.matchedSpot = spotsData.find(s => s.name === spotName);
      document.getElementById('mapLabel').textContent = `当前讲解：${spotName}`;
      updateGuideByState();
      showToast(`已切换讲解：${spotName}`);
    }

    function updateGuideByState() {
      setGuideCopy(state.mode);
    }

    function nextPage() { goPage(current + 1); }
    function prevPage() { goPage(current - 1); }

    function switchTab(tab) {
      const target = tab === 'trace' ? 0 : tab === 'activity' ? 3 : 5;
      goPage(target);
    }

    function showToast(text) {
      const toast = document.getElementById('toast');
      toast.textContent = text;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2100);
    }

    let cameraStream = null;

    async function openCamera() {
      document.getElementById('cameraOverlay').classList.add('show');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        cameraStream = stream;
        const video = document.getElementById('cameraVideo');
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      } catch (err) {
        console.error('无法获取摄像头权限:', err);
        showToast('无法获取摄像头权限，请检查浏览器设置');
      }
    }
    function closeCamera() {
      document.getElementById('cameraOverlay').classList.remove('show');
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
      }
    }
    function takePhoto() {
      closeCamera();
      fakeScan('camera');
    }

    function fakeScan(type) {
      document.getElementById('scanBox').style.display = 'block';
      const status = document.getElementById('scanStatus');
      const bubble = document.getElementById('aiBubble');
      const scanBtn = document.getElementById('scanBtn');
      scanBtn.classList.add('loading');
      scanBtn.textContent = type === 'camera' ? '取景识别中' : '上传识别中';
      status.textContent = type === 'camera' ? '相机取景中 · 识别藻井' : '图片上传中 · 匹配纹样库';
      bubble.textContent = '小衡正在旋转纹样、比对殿顶结构与色彩层次……';
      setTimeout(() => {
        scanBtn.classList.remove('loading');
        scanBtn.textContent = '拍照识别';
        status.textContent = '识别完成 · 命中藻井卡';
        bubble.textContent = '识别成功！这是“藻井”纹样：层层收束、向上聚焦，像把天空请进殿堂。已为你点亮藻井卡片。';
        document.querySelector('.pattern-card.featured').classList.add('collected');
        if (!state.collection.includes('藻井')) state.collection.push('藻井');
        updateCollectionDrawer();
        showToast('藻井卡片 +1，古建观察者进度更新');
      }, 1300);
    }

    function updateCollectionDrawer() {
      const drawer = document.getElementById('collectionDrawer');
      if (!drawer) return;
      drawer.textContent = `已收集：${state.collection.join('、')}。继续拍照可点亮斗拱与屋脊兽卡片。`;
    }

    function toggleCollection() {
      updateCollectionDrawer();
      const drawer = document.getElementById('collectionDrawer');
      drawer.classList.toggle('show');
      showToast(drawer.classList.contains('show') ? '已展开纹样卡册' : '已收起纹样卡册');
    }

    function setMode(btn, mode) {
      document.querySelectorAll('.mode-tab').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      state.mode = mode;
      setGuideCopy(mode);
    }

    function setGuideCopy(mode) {
      const title = document.getElementById('modeTitle');
      const text = document.getElementById('modeText');
      if (!title || !text) return;
      title.textContent = mode + '讲解';

      let baseText = "";
      if (state.matchedSpot) {
        baseText = `【${state.matchedSpot.name}】${state.matchedSpot.intro} `;
      } else {
        baseText = `你选择的是「${state.route}」路线，当前识别节点包括${state.sites}。`;
      }

      const copy = {
        '简短版': `${baseText}中轴线像城市的脊梁，让北京的秩序一眼可见。`,
        '深度版': `${baseText}北京中轴线是一套空间秩序：建筑等级、方位、对称共同构成礼制城市的表达。`,
        '故事版': `${baseText}想象你沿着前行，眼前的建筑像一页页展开的北京时间，小衡陪你慢慢走懂它们。`
      };
      text.textContent = copy[mode];
    }

    function answerQuestion(type) {
      const title = document.getElementById('modeTitle');
      const text = document.getElementById('modeText');
      if (type === 'meaning') {
        title.textContent = '小衡回答：纹样含义';
        text.textContent = '以藻井为例，它常位于重要殿堂顶部，形态层层递进、中心凝聚，既有装饰美，也表达对天穹、秩序与尊崇空间的想象。';
      } else {
        title.textContent = '小衡回答：与中轴线的关系';
        text.textContent = '中轴线强调方位、等级与礼序；古建筑纹样则把这种秩序缩小到梁枋、屋顶和细部里。看懂纹样，就能从微观处理解中轴线的宏观秩序。';
      }
    }

    syncPreferenceState();
    updateRouteSummary();
    updateCollectionDrawer();

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
    });
