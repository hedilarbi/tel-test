"use client";

import { useEffect, useMemo, useState } from "react";

/* ---------------------------------------------------------------------- */
/*  Small building blocks                                                 */
/* ---------------------------------------------------------------------- */

function ImagePlaceholder({ id, label }) {
  return (
    <div
      data-screenshot-id={id}
      className="mt-3 flex min-h-[120px] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center"
    >
      <span className="text-2xl">🖼️</span>
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className="text-[10px] text-slate-400">({id})</span>
    </div>
  );
}

function Tip({ children }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      💡 {children}
    </div>
  );
}

function Section({ id, icon, title, steps, tip, screenshotId, screenshotLabel, defaultOpen = false }) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm open:shadow-md"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-left select-none">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="text-base">{icon}</span> {title}
        </span>
        <span className="text-slate-400 transition-transform duration-200 group-open:rotate-180">
          ⌄
        </span>
      </summary>
      <div className="space-y-3 border-t border-slate-100 px-4 py-4 text-sm leading-relaxed text-slate-600">
        <ol className="list-decimal space-y-2 pl-5">
          {steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
        {tip && <Tip>{tip}</Tip>}
        <ImagePlaceholder id={screenshotId} label={screenshotLabel} />
      </div>
    </details>
  );
}

function CategoryHeading({ children }) {
  return (
    <h2 className="mt-8 mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
      {children}
    </h2>
  );
}

/* ---------------------------------------------------------------------- */
/*  Content — French                                                      */
/* ---------------------------------------------------------------------- */

function ContentFR() {
  return (
    <>
      <CategoryHeading>🚀 Démarrage</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="fr-start"
          icon="▶️"
          title="Démarrer le bot"
          defaultOpen
          steps={[
            "Ouvre le lien de ton bot personnel sur Telegram.",
            "Appuie sur le bouton « Démarrer » (ou envoie la commande /start).",
            "Le bot t'associe automatiquement à ce numéro Telegram — ce lien est définitif, un seul compte Telegram peut utiliser ce bot.",
            "Le menu principal s'affiche avec le statut du bot (Actif / Inactif).",
          ]}
          tip="Si tu reçois un message « déjà assigné à un autre utilisateur », cela veut dire que ce bot a déjà été relié à un autre compte Telegram. Contacte l'administrateur."
          screenshotId="fr-start-1"
          screenshotLabel="Capture : écran /start et menu principal"
        />
        <Section
          id="fr-activate"
          icon="🟢"
          title="Activer / Désactiver le bot"
          steps={[
            "Depuis le menu principal, appuie sur « 🟢 Activate » pour que le bot commence à accepter des courses selon tes filtres.",
            "Appuie sur « 🔴 Deactivate » pour mettre le bot en pause — aucune course ne sera acceptée tant qu'il est inactif.",
            "Le statut (✅ Active / ❌ Not active) est toujours visible en haut du menu.",
          ]}
          screenshotId="fr-activate-1"
          screenshotLabel="Capture : bouton Activate / Deactivate"
        />
      </div>

      <CategoryHeading>⚙️ Filtres</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="fr-price"
          icon="💸"
          title="Prix minimum / maximum"
          steps={[
            "Menu principal → « ⚙️ Filters ».",
            "Appuie sur « 💸 Change min price » pour le prix minimum, ou « 💸 Change max price » pour le prix maximum.",
            "Tape simplement le nombre (ex : 50) et envoie le message.",
            "Le bot ignorera toute course dont le prix est en dehors de cette fourchette.",
          ]}
          tip="Laisse le maximum à 0 si tu ne veux pas de limite haute."
          screenshotId="fr-price-1"
          screenshotLabel="Capture : changement du prix min/max"
        />
        <Section
          id="fr-km"
          icon="📏"
          title="Distance minimum / maximum (km)"
          steps={[
            "Menu principal → « ⚙️ Filters ».",
            "Appuie sur « 📏 Change min km » ou « 📏 Change max km ».",
            "Envoie un nombre (entier ou décimal), par exemple 50 pour le minimum ou 150 pour le maximum.",
            "Les courses dont la distance estimée est hors de cette plage seront automatiquement refusées.",
          ]}
          tip="C'est exactement ce champ qui sert à filtrer les courses « trop courtes » ou « trop longues »."
          screenshotId="fr-km-1"
          screenshotLabel="Capture : changement de la distance min/max"
        />
        <Section
          id="fr-duration"
          icon="⌛"
          title="Durée minimale (courses à l'heure)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « ⌛ Change duration ».",
            "Envoie la durée minimale en HEURES (ex : 2).",
            "Ce filtre s'applique uniquement aux courses de type « Hourly » (à l'heure) — les courses plus courtes que cette durée seront refusées.",
          ]}
          screenshotId="fr-duration-1"
          screenshotLabel="Capture : changement de la durée minimale"
        />
        <Section
          id="fr-gap"
          icon="⏳"
          title="Délai avant la course (gap)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « ⏳ Change gap (delay) ».",
            "Envoie le délai en MINUTES (ex : 100).",
            "Une course qui démarre dans moins de ce délai (par rapport à maintenant) sera automatiquement refusée — ça te laisse le temps de t'y rendre.",
          ]}
          screenshotId="fr-gap-1"
          screenshotLabel="Capture : changement du délai (gap)"
        />
        <Section
          id="fr-workschedule"
          icon="🕒"
          title="Horaire de travail"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 🕒 Work schedule ».",
            "Appuie sur « ✏️ Update schedule ».",
            "Envoie l'heure de DÉBUT au format HH:MM (ex : 08:00).",
            "Envoie ensuite l'heure de FIN au format HH:MM (ex : 20:00).",
            "Toute course prévue en dehors de cette plage horaire sera refusée.",
          ]}
          screenshotId="fr-workschedule-1"
          screenshotLabel="Capture : horaire de travail (début/fin)"
        />
        <Section
          id="fr-classes"
          icon="🚗"
          title="Classes de véhicules"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 🚗 Change classes ».",
            "Deux colonnes s'affichent : TRANSFER et HOURLY.",
            "Appuie sur une classe (SUV, VAN, Business, First, Electric, Sprinter) pour l'activer (🟢) ou la désactiver (🔴) pour chaque type de course.",
            "Seules les classes activées (🟢) pourront être acceptées par le bot.",
          ]}
          screenshotId="fr-classes-1"
          screenshotLabel="Capture : menu des classes de véhicules"
        />
        <Section
          id="fr-blacklist-pickup"
          icon="🚫"
          title="Liste noire — adresses de prise en charge (pickup)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 🚫 Pickup blacklist ».",
            "Appuie sur « ➕ Add pickup term » et envoie un mot-clé (ex : « airport »).",
            "Toute course dont l'adresse de départ contient ce mot sera refusée.",
            "Pour retirer un mot, appuie sur « 🗑️ » devant le terme concerné.",
          ]}
          screenshotId="fr-blacklist-pickup-1"
          screenshotLabel="Capture : liste noire pickup"
        />
        <Section
          id="fr-blacklist-dropoff"
          icon="🚫"
          title="Liste noire — adresses de destination (dropoff)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 🚫 Dropoff blacklist ».",
            "Appuie sur « ➕ Add dropoff term » et envoie un mot-clé.",
            "Toute course dont la destination contient ce mot sera refusée.",
          ]}
          screenshotId="fr-blacklist-dropoff-1"
          screenshotLabel="Capture : liste noire dropoff"
        />
        <Section
          id="fr-blacklist-flight"
          icon="✈️"
          title="Blocage de numéros de vol"
          steps={[
            "Menu principal → « ⚙️ Filters » → « ✈️ Block flights ».",
            "Appuie sur « ➕ Add flight number » et envoie le numéro de vol à bloquer.",
            "Toute course liée à ce numéro de vol sera automatiquement refusée.",
          ]}
          screenshotId="fr-blacklist-flight-1"
          screenshotLabel="Capture : blocage de vols"
        />
        <Section
          id="fr-blockeddays"
          icon="📅"
          title="Jours bloqués (via le calendrier)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 📅 Schedule (blocked days) ».",
            "Une mini-application calendrier s'ouvre directement dans Telegram.",
            "Appuie sur une date pour la bloquer (elle devient rouge) ou pour la débloquer si elle l'est déjà.",
            "Les changements sont enregistrés instantanément, aucune course ne sera acceptée les jours bloqués.",
          ]}
          screenshotId="fr-blockeddays-1"
          screenshotLabel="Capture : calendrier des jours bloqués"
        />
        <Section
          id="fr-bookedslots"
          icon="📦"
          title="Créneaux déjà réservés (booked slots)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 📦 Booked slots ».",
            "Appuie sur « ➕ Add booked slot ».",
            "Indique l'heure de début et de fin (et un nom optionnel, ex : « Rendez-vous client »).",
            "Le bot n'acceptera aucune course qui chevauche ce créneau.",
          ]}
          screenshotId="fr-bookedslots-1"
          screenshotLabel="Capture : créneaux réservés"
        />
        <Section
          id="fr-currentschedule"
          icon="🗓️"
          title="Voir l'horaire actuel"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 🗓️ Show current schedule ».",
            "Cette page (mini-application) affiche en un coup d'œil tous tes jours bloqués et créneaux réservés.",
            "C'est une vue de consultation uniquement — pour modifier, reviens sur « Schedule » ou « Booked slots ».",
          ]}
          screenshotId="fr-currentschedule-1"
          screenshotLabel="Capture : vue de l'horaire actuel"
        />
        <Section
          id="fr-customfilters"
          icon="🧩"
          title="Filtres personnalisés"
          steps={[
            "Menu principal → « ⚙️ Filters » → « 🧩 Custom filters ».",
            "Une mini-application liste les filtres spéciaux activés pour ton bot (configurés par l'administrateur), par exemple :",
            "« Ajouter Airport à la liste noire pickup » — quand actif, le bot refuse toute prise en charge à l'aéroport.",
            "« Bloquer les demandes de siège bébé » — quand actif, le bot refuse automatiquement toute course avec une demande de siège bébé.",
            "Appuie sur « Activate » ou « Deactivate » pour chaque filtre selon tes besoins.",
          ]}
          tip="Si tu ne vois aucun filtre personnalisé, c'est normal — ils sont ajoutés par l'administrateur selon les besoins."
          screenshotId="fr-customfilters-1"
          screenshotLabel="Capture : filtres personnalisés"
        />
        <Section
          id="fr-showallfilters"
          icon="⚖️"
          title="Voir tous les filtres actuels (résumé)"
          steps={[
            "Menu principal → « ⚙️ Filters » → « ⚖️ Show current filters ».",
            "Un résumé complet s'affiche : prix, distance, horaires, classes, listes noires, formules de fin de course, jours bloqués et créneaux réservés.",
            "Pratique pour vérifier d'un coup tous tes réglages actuels.",
          ]}
          screenshotId="fr-showallfilters-1"
          screenshotLabel="Capture : résumé de tous les filtres"
        />
      </div>

      <CategoryHeading>🔧 Paramètres</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="fr-mobilesession"
          icon="📱"
          title="Session mobile (token)"
          steps={[
            "Menu principal → « 🔧 Settings » → « 📱 Mobile sessions ».",
            "Appuie sur « ➕ Add/Update token ».",
            "Copie-colle le dump HTTP complet (avec l'en-tête Authorization: Bearer ...) fourni par l'application mobile.",
            "Le bot valide et enregistre automatiquement ton accès.",
          ]}
          tip="Sans token valide, le bot ne peut pas accepter de courses en ton nom."
          screenshotId="fr-mobilesession-1"
          screenshotLabel="Capture : ajout du token mobile"
        />
        <Section
          id="fr-autorefresh"
          icon="🔄"
          title="Renouvellement automatique du token"
          steps={[
            "Menu principal → « 🔧 Settings ».",
            "Appuie sur le bouton « 🔄 Auto refresh: ON/OFF » pour l'activer ou le désactiver.",
            "Quand il est activé, le bot tente de renouveler ton token automatiquement avant qu'il n'expire.",
          ]}
          screenshotId="fr-autorefresh-1"
          screenshotLabel="Capture : auto refresh token"
        />
        <Section
          id="fr-notifications"
          icon="🔔"
          title="Notifications"
          steps={[
            "Menu principal → « 🔧 Settings » → « 🔔 Notifications ».",
            "Trois types sont disponibles : courses acceptées, courses non acceptées, courses non valides (rejetées par un filtre).",
            "Appuie sur chaque ligne pour activer/désactiver ce type de notification.",
          ]}
          screenshotId="fr-notifications-1"
          screenshotLabel="Capture : menu des notifications"
        />
        <Section
          id="fr-blaccount"
          icon="🪪"
          title="Compte BL (email / mot de passe)"
          steps={[
            "Menu principal → « 🔧 Settings » → « 🪪 BL account ».",
            "Une mini-application s'ouvre avec un formulaire.",
            "Renseigne ton email et ton mot de passe, puis appuie sur « Save account ».",
            "L'email actuellement enregistré (masqué) s'affiche en haut de la page.",
          ]}
          screenshotId="fr-blaccount-1"
          screenshotLabel="Capture : formulaire compte BL"
        />
        <Section
          id="fr-timezone"
          icon="🌍"
          title="Fuseau horaire (réservé à l'administrateur)"
          steps={[
            "Le fuseau horaire d'un utilisateur ne peut être modifié QUE par l'administrateur, pas par l'utilisateur lui-même.",
            "L'administrateur va dans son bot admin → « /listbots » → sélectionne le bot concerné → « 🔧 Settings » → « 🌍 Change timezone ».",
            "Il envoie le nom IANA du fuseau horaire (ex : Africa/Casablanca, America/Toronto).",
            "Si tu as besoin de corriger ton fuseau horaire, contacte l'administrateur.",
          ]}
          screenshotId="fr-timezone-1"
          screenshotLabel="Capture : changement du fuseau horaire (vue admin)"
        />
      </div>

      <CategoryHeading>📊 Statistiques</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="fr-statistic"
          icon="📊"
          title="Statistiques (résumé)"
          steps={[
            "Menu principal → « 📊 Statistic ».",
            "Un résumé s'affiche : total des offres, répartition par statut (acceptées, non valides, non acceptées), par type (transfer/hourly) et par classe de véhicule.",
            "Utilise les boutons en bas (Aujourd'hui, Hier, 7 jours, 30 jours, ce mois, etc.) pour changer la période affichée.",
          ]}
          screenshotId="fr-statistic-1"
          screenshotLabel="Capture : résumé des statistiques"
        />
        <Section
          id="fr-checkedstatistic"
          icon="✅"
          title="Statistiques détaillées (historique des offres)"
          steps={[
            "Menu principal → « ✅ Checked statistic ».",
            "La liste détaillée de chaque offre reçue s'affiche (prix, classe, adresses, horaires, statut...).",
            "Utilise « ⬅️ Prev » / « Next ➡️ » pour naviguer entre les pages.",
          ]}
          screenshotId="fr-checkedstatistic-1"
          screenshotLabel="Capture : historique détaillé des offres"
        />
      </div>

      <CategoryHeading>❓ Besoin d’aide ?</CategoryHeading>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <p>
          Si un réglage ne correspond pas à ce que tu attendais, utilise «{" "}
          <strong>⚖️ Show current filters</strong> » dans le menu Filtres pour
          vérifier tous tes paramètres actuels en un coup d’œil.
        </p>
        <p className="mt-2">
          Pour toute question qui ne serait pas couverte ici, contacte
          l’administrateur du bot.
        </p>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  Content — English                                                     */
/* ---------------------------------------------------------------------- */

function ContentEN() {
  return (
    <>
      <CategoryHeading>🚀 Getting started</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="en-start"
          icon="▶️"
          title="Starting the bot"
          defaultOpen
          steps={[
            "Open your personal bot's link on Telegram.",
            "Tap the \"Start\" button (or send the /start command).",
            "The bot links itself to this Telegram account automatically — this link is permanent, only one Telegram account can use this bot.",
            "The main menu appears with the bot's status (Active / Not active).",
          ]}
          tip={`If you get an "already assigned to another user" message, this bot has already been claimed by a different Telegram account. Contact the administrator.`}
          screenshotId="en-start-1"
          screenshotLabel="Screenshot: /start screen and main menu"
        />
        <Section
          id="en-activate"
          icon="🟢"
          title="Activate / Deactivate the bot"
          steps={[
            "From the main menu, tap \"🟢 Activate\" so the bot starts accepting rides according to your filters.",
            "Tap \"🔴 Deactivate\" to pause the bot — no ride will be accepted while it's inactive.",
            "The status (✅ Active / ❌ Not active) is always shown at the top of the menu.",
          ]}
          screenshotId="en-activate-1"
          screenshotLabel="Screenshot: Activate / Deactivate button"
        />
      </div>

      <CategoryHeading>⚙️ Filters</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="en-price"
          icon="💸"
          title="Minimum / maximum price"
          steps={[
            "Main menu → \"⚙️ Filters\".",
            "Tap \"💸 Change min price\" for the minimum price, or \"💸 Change max price\" for the maximum.",
            "Just type the number (e.g. 50) and send the message.",
            "The bot will ignore any ride priced outside this range.",
          ]}
          tip="Leave the maximum at 0 if you don't want an upper limit."
          screenshotId="en-price-1"
          screenshotLabel="Screenshot: changing min/max price"
        />
        <Section
          id="en-km"
          icon="📏"
          title="Minimum / maximum distance (km)"
          steps={[
            "Main menu → \"⚙️ Filters\".",
            "Tap \"📏 Change min km\" or \"📏 Change max km\".",
            "Send a number (integer or decimal), e.g. 50 for minimum or 150 for maximum.",
            "Rides whose estimated distance falls outside this range will be automatically rejected.",
          ]}
          tip={`This is exactly the field used to filter out rides that are "too short" or "too long".`}
          screenshotId="en-km-1"
          screenshotLabel="Screenshot: changing min/max distance"
        />
        <Section
          id="en-duration"
          icon="⌛"
          title="Minimum duration (hourly rides)"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"⌛ Change duration\".",
            "Send the minimum duration in HOURS (e.g. 2).",
            "This filter only applies to \"Hourly\" rides — rides shorter than this duration will be rejected.",
          ]}
          screenshotId="en-duration-1"
          screenshotLabel="Screenshot: changing minimum duration"
        />
        <Section
          id="en-gap"
          icon="⏳"
          title="Delay before the ride (gap)"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"⏳ Change gap (delay)\".",
            "Send the delay in MINUTES (e.g. 100).",
            "A ride starting sooner than this delay from now will be automatically rejected — it gives you time to get there.",
          ]}
          screenshotId="en-gap-1"
          screenshotLabel="Screenshot: changing the gap (delay)"
        />
        <Section
          id="en-workschedule"
          icon="🕒"
          title="Work schedule"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"🕒 Work schedule\".",
            "Tap \"✏️ Update schedule\".",
            "Send the START time in HH:MM format (e.g. 08:00).",
            "Then send the END time in HH:MM format (e.g. 20:00).",
            "Any ride scheduled outside this time window will be rejected.",
          ]}
          screenshotId="en-workschedule-1"
          screenshotLabel="Screenshot: work schedule (start/end)"
        />
        <Section
          id="en-classes"
          icon="🚗"
          title="Vehicle classes"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"🚗 Change classes\".",
            "Two columns are shown: TRANSFER and HOURLY.",
            "Tap a class (SUV, VAN, Business, First, Electric, Sprinter) to turn it on (🟢) or off (🔴) for each ride type.",
            "Only enabled classes (🟢) can be accepted by the bot.",
          ]}
          screenshotId="en-classes-1"
          screenshotLabel="Screenshot: vehicle classes menu"
        />
        <Section
          id="en-blacklist-pickup"
          icon="🚫"
          title="Pickup address blacklist"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"🚫 Pickup blacklist\".",
            "Tap \"➕ Add pickup term\" and send a keyword (e.g. \"airport\").",
            "Any ride whose pickup address contains this word will be rejected.",
            "To remove a term, tap \"🗑️\" next to it.",
          ]}
          screenshotId="en-blacklist-pickup-1"
          screenshotLabel="Screenshot: pickup blacklist"
        />
        <Section
          id="en-blacklist-dropoff"
          icon="🚫"
          title="Dropoff address blacklist"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"🚫 Dropoff blacklist\".",
            "Tap \"➕ Add dropoff term\" and send a keyword.",
            "Any ride whose destination contains this word will be rejected.",
          ]}
          screenshotId="en-blacklist-dropoff-1"
          screenshotLabel="Screenshot: dropoff blacklist"
        />
        <Section
          id="en-blacklist-flight"
          icon="✈️"
          title="Flight number blocking"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"✈️ Block flights\".",
            "Tap \"➕ Add flight number\" and send the flight number to block.",
            "Any ride linked to this flight number will be automatically rejected.",
          ]}
          screenshotId="en-blacklist-flight-1"
          screenshotLabel="Screenshot: flight blocking"
        />
        <Section
          id="en-blockeddays"
          icon="📅"
          title="Blocked days (calendar)"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"📅 Schedule (blocked days)\".",
            "A calendar mini-app opens directly inside Telegram.",
            "Tap a date to block it (it turns red), or to unblock it if it's already blocked.",
            "Changes save instantly — no ride will be accepted on blocked days.",
          ]}
          screenshotId="en-blockeddays-1"
          screenshotLabel="Screenshot: blocked days calendar"
        />
        <Section
          id="en-bookedslots"
          icon="📦"
          title="Booked slots"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"📦 Booked slots\".",
            "Tap \"➕ Add booked slot\".",
            "Enter the start and end time (and an optional name, e.g. \"Client meeting\").",
            "The bot won't accept any ride that overlaps this slot.",
          ]}
          screenshotId="en-bookedslots-1"
          screenshotLabel="Screenshot: booked slots"
        />
        <Section
          id="en-currentschedule"
          icon="🗓️"
          title="View current schedule"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"🗓️ Show current schedule\".",
            "This mini-app page shows all your blocked days and booked slots at a glance.",
            "This is a read-only view — to make changes, go back to \"Schedule\" or \"Booked slots\".",
          ]}
          screenshotId="en-currentschedule-1"
          screenshotLabel="Screenshot: current schedule view"
        />
        <Section
          id="en-customfilters"
          icon="🧩"
          title="Custom filters"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"🧩 Custom filters\".",
            "A mini-app lists the special filters enabled for your bot (configured by the administrator), for example:",
            "\"Add Airport to pickup blacklist\" — when active, the bot rejects any airport pickup.",
            "\"Block baby seat requests\" — when active, the bot automatically rejects any ride with a baby seat request.",
            "Tap \"Activate\" or \"Deactivate\" for each filter as needed.",
          ]}
          tip="If you don't see any custom filter, that's normal — they're added by the administrator as needed."
          screenshotId="en-customfilters-1"
          screenshotLabel="Screenshot: custom filters"
        />
        <Section
          id="en-showallfilters"
          icon="⚖️"
          title="View all current filters (summary)"
          steps={[
            "Main menu → \"⚙️ Filters\" → \"⚖️ Show current filters\".",
            "A full summary is displayed: price, distance, schedule, classes, blacklists, end-time formulas, blocked days and booked slots.",
            "Handy to check all your current settings at once.",
          ]}
          screenshotId="en-showallfilters-1"
          screenshotLabel="Screenshot: full filters summary"
        />
      </div>

      <CategoryHeading>🔧 Settings</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="en-mobilesession"
          icon="📱"
          title="Mobile session (token)"
          steps={[
            "Main menu → \"🔧 Settings\" → \"📱 Mobile sessions\".",
            "Tap \"➕ Add/Update token\".",
            "Paste the full HTTP dump (including the Authorization: Bearer ... header) provided by the mobile app.",
            "The bot validates and saves your access automatically.",
          ]}
          tip="Without a valid token, the bot cannot accept rides on your behalf."
          screenshotId="en-mobilesession-1"
          screenshotLabel="Screenshot: adding the mobile token"
        />
        <Section
          id="en-autorefresh"
          icon="🔄"
          title="Token auto refresh"
          steps={[
            "Main menu → \"🔧 Settings\".",
            "Tap the \"🔄 Auto refresh: ON/OFF\" button to enable or disable it.",
            "When enabled, the bot tries to renew your token automatically before it expires.",
          ]}
          screenshotId="en-autorefresh-1"
          screenshotLabel="Screenshot: token auto refresh"
        />
        <Section
          id="en-notifications"
          icon="🔔"
          title="Notifications"
          steps={[
            "Main menu → \"🔧 Settings\" → \"🔔 Notifications\".",
            "Three types are available: accepted rides, not-accepted rides, not-valid rides (rejected by a filter).",
            "Tap each line to enable/disable that notification type.",
          ]}
          screenshotId="en-notifications-1"
          screenshotLabel="Screenshot: notifications menu"
        />
        <Section
          id="en-blaccount"
          icon="🪪"
          title="BL account (email / password)"
          steps={[
            "Main menu → \"🔧 Settings\" → \"🪪 BL account\".",
            "A mini-app opens with a form.",
            "Enter your email and password, then tap \"Save account\".",
            "The currently saved (masked) email is shown at the top of the page.",
          ]}
          screenshotId="en-blaccount-1"
          screenshotLabel="Screenshot: BL account form"
        />
        <Section
          id="en-timezone"
          icon="🌍"
          title="Timezone (admin only)"
          steps={[
            "A user's timezone can ONLY be changed by the administrator, not by the user themself.",
            "The administrator goes to the admin bot → \"/listbots\" → selects the relevant bot → \"🔧 Settings\" → \"🌍 Change timezone\".",
            "They send the IANA timezone name (e.g. Africa/Casablanca, America/Toronto).",
            "If you need your timezone corrected, contact the administrator.",
          ]}
          screenshotId="en-timezone-1"
          screenshotLabel="Screenshot: changing timezone (admin view)"
        />
      </div>

      <CategoryHeading>📊 Statistics</CategoryHeading>
      <div className="space-y-3">
        <Section
          id="en-statistic"
          icon="📊"
          title="Statistics (summary)"
          steps={[
            "Main menu → \"📊 Statistic\".",
            "A summary is shown: total offers, breakdown by status (accepted, not valid, not accepted), by type (transfer/hourly) and by vehicle class.",
            "Use the buttons at the bottom (Today, Yesterday, 7 days, 30 days, current month, etc.) to change the displayed period.",
          ]}
          screenshotId="en-statistic-1"
          screenshotLabel="Screenshot: statistics summary"
        />
        <Section
          id="en-checkedstatistic"
          icon="✅"
          title="Detailed statistics (offer history)"
          steps={[
            "Main menu → \"✅ Checked statistic\".",
            "The detailed list of every received offer is shown (price, class, addresses, times, status...).",
            "Use \"⬅️ Prev\" / \"Next ➡️\" to navigate between pages.",
          ]}
          screenshotId="en-checkedstatistic-1"
          screenshotLabel="Screenshot: detailed offer history"
        />
      </div>

      <CategoryHeading>❓ Need help?</CategoryHeading>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <p>
          If a setting doesn&apos;t match what you expected, use{" "}
          <strong>&quot;⚖️ Show current filters&quot;</strong> in the Filters
          menu to check all your current settings at a glance.
        </p>
        <p className="mt-2">
          For anything not covered here, contact the bot administrator.
        </p>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------- */
/*  Page                                                                   */
/* ---------------------------------------------------------------------- */

export default function DocumentationPage() {
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    const wa =
      typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
    if (wa) {
      try {
        wa.ready();
        wa.expand();
        wa.setHeaderColor && wa.setHeaderColor("#ffffff");
        wa.setBackgroundColor && wa.setBackgroundColor("#ffffff");
      } catch {}
    }
  }, []);

  const title = useMemo(
    () => (lang === "fr" ? "📖 Guide d'utilisation" : "📖 User guide"),
    [lang]
  );
  const subtitle = useMemo(
    () =>
      lang === "fr"
        ? "Tout savoir sur les réglages de ton bot"
        : "Everything about configuring your bot",
    [lang]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-md px-5 py-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <div className="flex shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-sm">
            <button
              onClick={() => setLang("fr")}
              className={[
                "px-3 py-1.5 text-xs font-semibold transition",
                lang === "fr"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:bg-slate-50",
              ].join(" ")}
            >
              FR
            </button>
            <button
              onClick={() => setLang("en")}
              className={[
                "px-3 py-1.5 text-xs font-semibold transition",
                lang === "en"
                  ? "bg-slate-800 text-white"
                  : "text-slate-500 hover:bg-slate-50",
              ].join(" ")}
            >
              EN
            </button>
          </div>
        </div>

        <p className="mt-4 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
          {lang === "fr"
            ? "Astuce : appuie sur un titre pour ouvrir/fermer une section."
            : "Tip: tap a title to open/close a section."}
        </p>

        <div className="mt-2">{lang === "fr" ? <ContentFR /> : <ContentEN />}</div>

        <p className="mt-8 text-center text-[11px] text-slate-400">
          {lang === "fr"
            ? "Document généré automatiquement — sujet à mises à jour."
            : "Auto-generated document — subject to updates."}
        </p>
      </div>
    </div>
  );
}
