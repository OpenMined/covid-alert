import React from 'react';
import {Text} from 'react-native';

import styles from './App.styles';

const B = props => <Text style={styles.bold}>{props.children}</Text>;

export default {
  en: {
    message:
      'Patient(s) with reported COVID-19 cases have been within 100m of your current location in the past 72 hours. We suggest that you if you choose to leave, please do so calmly and quietly.',
    scanning: 'Actively Scanning',
    body: (
      <>
        This app will <B>anonymously</B> log your location in the background and
        send a notification to your phone when you’re close to known previous
        locations of COVID-19 victims.{' '}
        <B>In order to work, please keep this app open on your phone.</B>
      </>
    ),
    getStarted: 'To get started please:',
    locationSharing: 'Enable location sharing (always)',
    pushNotifications: 'Enable push notifications',
    privacy: 'How do we protect your privacy?',
    support: 'How can I support this app?',
    volunteers: 'Built by volunteers at',
  },
  es: {
    message:
      'Casos confirmados de COVID-19 han estado en un radio de 100m de su localización actual en las pasadas 72 horas. Le recomendamos que, si decide salir, lo haga de manera calmada.',
    scanning: 'Escaneo activo',
    body: (
      <>
        Esta app registra su localización <B>anónimamente</B> y envía una
        notificación a su teléfono cuando se encuentra cerca de localizaciones
        conocidas de víctimas de COVID-19.{' '}
        <B>Esta app necesita estar abierta para su correcto funcionamiento.</B>
      </>
    ),
    getStarted: 'Para empezar:',
    locationSharing: 'Habilitar compartir la localización (siempre)',
    pushNotifications: 'Habilitar notificaciones',
    privacy: '¿Cómo protegemos su privacidad?',
    support: '¿Cómo puedo apoyar esta app?',
    volunteers: 'Hecho por voluntarios de',
  },
  it: {
    message:
      'Paziente(i) diagnosticati di COVID-19 sono stati tra i 100mila nella tua attuale posizione nelle scorse 72 ore. Ti raccomandiamo che se scegli di uscire, tu lo faccia con calme e piano.',
    scanning: 'Scannerizzando',
    body: (
      <>
        Questa app registra <B>anonimamente</B> la tua posizione sullo sfondo ed
        invia una notifica al tuo telefono quando ti trovi vicino a luoghi dove
        si sono trovate vittime del COVID-19.{' '}
        <B>
          Per garantire il funzionamento dell’App mantienila aperta per favore.
        </B>
      </>
    ),
    getStarted: 'Inizio:',
    locationSharing: 'Condividi la tua posizione (Sempre)',
    pushNotifications: 'Attiva le notifiche',
    privacy: 'Come proteggiamo la tua Privacy?',
    support: 'Come posso sotenere l’App?',
    volunteers: 'Realizzata da Volontari da',
  },
  pt: {
    message:
      'Paciente(s) com casos relatados de COVID-19 estiveram dentro de 100m da sua localização atual nas últimas 72 horas. Sugerimos que, se optar por sair, faça-o com calma e silêncio.',
    scanning: 'Analisando',
    body: (
      <>
        Este aplicativo irá registrar <B>anonimamente</B> sua localização
        enquanto estiver com o app em segundo plano e enviará uma notificação
        para o seu telefone quando você estiver próximo a locais que foram
        frequentados por vítimas do COVID-19.{' '}
        <B>Para funcionar, é só deixar o app aberto no seu telefone.</B>
      </>
    ),
    getStarted: 'Para começar, por favor:',
    locationSharing: 'Ative o compartilhamento de localização (sempre)',
    pushNotifications: 'Ative as notificações',
    privacy: 'Como protegemos sua privacidade?',
    support: 'Como posso apoiar este aplicativo?',
    volunteers: 'Feito por voluntários da',
  },
  fr: {
    message:
      'Des patients signalés comme porteurs du COVID-19 ont été signalés à moins de 100 m de votre lieu de résidence actuel au cours des 72 dernières heures. Nous vous suggérons, si vous décidez de partir, de le faire calmement et sans précipitation.',
    scanning: 'Détection en cours',
    body: (
      <>
        Cette application enregistre <B>anonymement</B> votre position en
        arrière-plan et vous envoie une notification lorsque vous êtes à
        proximté de lieux connus de victimes de COVID-19.{' '}
        <B>
          {' '}
          Pour que cette application fonctionne, veuillez la laisser ouverte sur
          votre téléphone.{' '}
        </B>
      </>
    ),
    getStarted: 'Avant de commencer, merci de bien vouloir:',
    locationSharing: 'Autoriser le partage de localisation (toujours)',
    pushNotifications: 'Autoriser les notifications push',
    privacy: 'Nous protégeons votre vie privée?',
    support: 'Soutenez-nous!',
    volunteers: 'Proposé par',
  },
  ru: {
    message:
      'Пациенты с подтвержденным диагнозом COVID-19 находились в пределах 100 м от вашего местонахождения в последние 72 часа. Если вы решите покинуть это место, пожалуйста, делайте это спокойно.',
    scanning: 'Идет Проверка...',
    body: (
      <>
        Это приложение <B>анонимно</B> проверяет ваше местонахождение и
        присылает уведомление, если вы оказались поблизости от мест, где
        находились люди, зараженные COVID-19.{' '}
        <B>Чтобы приложение работало, пожалуйста, не закрывайте его.</B>
      </>
    ),
    getStarted: 'Чтобы начать:',
    locationSharing: 'Включите доступ к геолокации',
    pushNotifications: 'Включите пуш-уведомления',
    privacy: 'Как защищены мои личные данные?',
    support: 'Как я могу помочь этому проекту?',
    volunteers: 'Сделано волонтерами',
  },
  ar: {
    message:
      ' أنت في منطقة فيروس COVID-19 ، يرجى محاولة مغادرة هذا المكان بهدوء',
    scanning: 'المسح بنشاط',
    body: (
      <>
        هذا التطبيق سوف يسجيل موقعك في الخلفية
        <B> بسرية ودون معرفة هوية المستعمل </B>
        COVID-19 و يرسل إشعارًا إلى هاتفك عندما تكون قريبًا من المواقع السابقة
        لضحايا
        <B> من أجل العمل ، يرجى إبقاء هذا التطبيق مفتوحًا على هاتفك </B>
      </>
    ),
    getStarted: 'للبدء ، يرجى',
    locationSharing: '(تمكين مشاركة الموقع (دائمً',
    pushNotifications: 'تمكين دفع الإشعارات',
    privacy: 'كيف نحمي خصوصيتك؟',
    support: 'كيف يمكنني دعم هذا التطبيق؟',
    volunteers: 'بناها المتطوعون في',
  },
  zh: {
    message:
      '在过去72小时内, 有COVID-19患者在您当前位置的100m之内. 如果您选择离开高险区, 请您冷静/安静地离开.',
    scanning: '正在主动监控疫情数据',
    body: (
      <>
        此应用将在后端<B>匿名</B>记录您的位置. 在您接近COVID-19患者 或
        患者最近经过区域时, 此应用会向您的手机发送通知.{' '}
        <B>请您在手机上将此应用保持打开状态,才能到通知。</B>
      </>
    ),
    getStarted: '开始使用, 请您:',
    locationSharing: '始终启用位置共享',
    pushNotifications: '启用推送通知',
    privacy: '我们如何保护您的隐私?',
    support: '我如何支持此应用?',
    volunteers: '由多名志愿者开发@',
  },
  hi: {
    message:
      'कोविड-१९ से संक्रमित मरीज़ आपके वर्तमान स्थान के सौ मीटर की सीमा में पिछले बहत्तर घंटो में पाए गए हैं | हमारा सुझाव है की अगर आप यहां से जाना चुने, तोह आप आराम और शान्ति से जाएँ |',
    scanning: 'सक्रिय रूप से जांच रहे हैं ',
    body: (
      <>
        यह एप्लीकेशन आपके स्थान की जानकारी <B>बिना आपके नाम के</B> बैकग्राउंड में रखेगी, और अगर आप किसी कोविड-१९ मरीज़ के पिछले स्थान के पास हों तोह यह एप्लीकेशन आपके फ़ोन को एक नोटिफिकेशन चेतावनी भेज दे गी | {' '}
        <B> एप्लीकेशन के काम करने के लिए कृपया यह एप्लीकेशन अपने फ़ोन पर खुला रखें | </B>
      </>
    ),
    getStarted: 'शुरुआत करने के लिए:',
    locationSharing: 'स्थान की जानकारी की शेयरिंग सक्षम करें(हमेशा)',
    pushNotifications: 'पुश नोटिफिकेशन सक्षम करें',
    privacy: 'हम आपकी एकान्तता कैसे बनाये रखें?',
    support: 'मैं इस एप्लीकेशन को कैसे सहारा दूँ?',
    volunteers: 'बनाया गया यहां के स्वयंसेवकों ने:',
  },
};
