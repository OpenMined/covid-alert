import React from "react";
import { Text } from "react-native";

import styles from "./App.styles";

const B = props => <Text style={styles.bold}>{props.children}</Text>;

export default {
  en: {
    message:
      "Patient(s) with reported COVID-19 cases have been within 100m of your current location in the past 72 hours. We suggest that you if you choose to leave, please do so calmly and quietly.",
    scanning: "Actively Scanning",
    body: (
      <>
        This app will <B>anonymously</B> log your location in the background and
        send a notification to your phone when you’re close to known previous
        locations of COVID-19 victims.{" "}
        <B>In order to work, please keep this app open on your phone.</B>
      </>
    ),
    getStarted: "To get started please:",
    locationSharing: "Enable location sharing (always)",
    pushNotifications: "Enable push notifications",
    privacy: "How do we protect your privacy?",
    support: "How can I support this app?",
    volunteers: "Built by volunteers at"
  },
  es: {
    message:
      "Casos confirmados de COVID-19 han estado en un radio de 100m de su localización actual en las pasadas 72 horas. Le recomendamos que, si decide salir, lo haga de manera calmada.",
    scanning: "Escaneo activo",
    body: (
      <>
        Esta app registra su localización <B>anónimamente</B> y envía una
        notificación a su teléfono cuando se encuentra cerca de localizaciones
        conocidas de víctimas de COVID-19.{" "}
        <B>Esta app necesita estar abierta para su correcto funcionamiento.</B>
      </>
    ),
    getStarted: "Para empezar:",
    locationSharing: "Habilitar compartir la localización (siempre)",
    pushNotifications: "Habilitar notificaciones",
    privacy: "¿Cómo protegemos su privacidad?",
    support: "¿Cómo puedo apoyar esta app?",
    volunteers: "Hecho por voluntarios de"
  },
  pt: {
    message:
      "Paciente(s) com casos relatados de COVID-19 estiveram dentro de 100m da sua localização atual nas últimas 72 horas. Sugerimos que, se optar por sair, faça-o com calma e silêncio.",
    scanning: "Analisando",
    body: (
      <>
        Este aplicativo vai registrar <B>anonimamente</B> sua localização em
        segundo plano e enviará uma notificação para o seu telefone quando você
        estiver perto de locais anteriores conhecidos das vítimas do COVID-19.{" "}
        <B>Para funcionar, mantenha o aplicativo aberto no seu telefone.</B>
      </>
    ),
    getStarted: "Para começar, por favor:",
    locationSharing: "Ative o compartilhamento de localização (sempre)",
    pushNotifications: "Ative as notificações",
    privacy: "Como protegemos sua privacidade?",
    support: "Como posso apoiar este aplicativo?",
    volunteers: "Feito por voluntários da"
  },
  fr: {
    message:
      "Des patients signalés comme porteurs du COVID-19 ont été signalés à moins de 100 m de votre lieu de résidence actuel au cours des 72 dernières heures. Nous vous suggérons, si vous décidez de partir, de le faire calmement et sans précipitation.",
    scanning: "Détection en cours",
    body: (
      <>
        Cette application enregistre <B>anonymement</B> votre position en
        arrière-plan et vous envoie une notification lorsque vous êtes à
        proximté de lieux connus de victimes de COVID-19.{" "}
        <B>
          {" "}
          Pour que cette application fonctionne, veuillez la laisser ouverte sur
          votre téléphone.{" "}
        </B>
      </>
    ),
    getStarted: "Avant de commencer, merci de bien vouloir:",
    locationSharing: "Autoriser le partage de localisation (toujours)",
    pushNotifications: "Autoriser les notifications push",
    privacy: "Comment protégeons-nous votre vie privée?",
    support: "Comment puis-je soutenir cette application?",
    volunteers: "Construit par la communauté"
  },
  ru: {
    message:
      "Пациенты с подтвержденным диагнозом COVID-19 находились в пределах 100 м от вашего местонахождения в последние 72 часа. Если вы решите покинуть это место, пожалуйста, делайте это спокойно.",
    scanning: "Идет Проверка...",
    body: (
      <>
        Это приложение <B>анонимно</B> проверяет ваше местонахождение и
        присылает уведомление, если вы оказались поблизости от мест, где
        находились люди, зараженные COVID-19.{" "}
        <B>Чтобы приложение работало, пожалуйста, не закрывайте его.</B>
      </>
    ),
    getStarted: "Чтобы начать:",
    locationSharing: "Включите доступ к геолокации",
    pushNotifications: "Включите пуш-уведомления",
    privacy: "Как защищены мои личные данные?",
    support: "Как я могу помочь этому проекту?",
    volunteers: "Сделано волонтерами"
  },
  ar: {},
  zh: {}
};
