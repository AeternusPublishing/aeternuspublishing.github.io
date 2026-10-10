// Dates describe operations, not publication dates. Keep sources distinct from
// editions: a work can be cited here while its AETERNUS edition is forthcoming.
const entries = [
  {
    id: 'first-afghan-war', start: 1839, end: 1842,
    evidence: { label: 'National Army Museum', url: 'https://www.nam.ac.uk/explore/first-afghan-war' },
    de: {
      region: 'Afghanistan · Kabul und Dschalalabad', title: 'Erster Afghanischer Krieg',
      account: 'Die britisch-indische Intervention sollte Einfluss auf Kabul sichern. Beim Rückzug der Garnison unter William Elphinstone im Winter 1842 brachen Schutz und Versorgung der Kolonne zusammen; Robert Sale hielt Dschalalabad. Die Operation zeigte die Verwundbarkeit einer Besatzung ohne gesicherte Verbindungen.',
      people: 'William Elphinstone · Robert Sale · Florentia Sale',
      sources: ['Florentia Sale, Journal of the Disasters in Affghanistan (1843)'],
      connection: 'Die Frage nach Kabuls Stellung zwischen Indien und Zentralasien kehrte im Zweiten Afghanischen Krieg zurück.',
      connectionId: 'second-afghan-war'
    },
    en: {
      region: 'Afghanistan · Kabul and Jalalabad', title: 'First Anglo-Afghan War',
      account: 'The British Indian intervention sought to secure influence in Kabul. During the withdrawal under William Elphinstone in the winter of 1842, protection and supply of the column collapsed; Robert Sale held Jalalabad. The campaign exposed the weakness of an occupation without secure lines of communication.',
      people: 'William Elphinstone · Robert Sale · Florentia Sale',
      sources: ['Florentia Sale, Journal of the Disasters in Affghanistan (1843)'],
      connection: 'Kabul’s position between India and Central Asia returned to the centre of British policy in the Second Anglo-Afghan War.',
      connectionId: 'second-afghan-war'
    }
  },
  {
    id: 'indian-rebellion', start: 1857, end: 1858,
    evidence: { label: 'National Army Museum', url: 'https://www.nam.ac.uk/explore/decisive-events-indian-mutiny' },
    de: {
      region: 'Nordindien · Delhi und Lucknow', title: 'Indischer Aufstand',
      account: 'Der Aufstand von 1857 erfasste große Teile Nordindiens; Delhi und Lucknow wurden zu Brennpunkten langwieriger Kämpfe. Mit seiner Niederschlagung endete die Herrschaft der East India Company, und die britische Krone übernahm 1858 die Verwaltung. Belagerungen, indische Truppen und Nachschub prägten den Verlauf.',
      people: 'Frederick Sleigh Roberts · Colin Campbell · Bahadur Shah Zafar',
      sources: ['Frederick Sleigh Roberts, Forty-One Years in India (1897)'],
      connection: 'Roberts’ Erinnerungen führen von Delhi und Lucknow zu seinem Feldzug in Afghanistan.',
      connectionId: 'second-afghan-war'
    },
    en: {
      region: 'Northern India · Delhi and Lucknow', title: 'Indian Rebellion',
      account: 'The uprising of 1857 spread across much of northern India; Delhi and Lucknow became centres of prolonged fighting. Its suppression ended the rule of the East India Company, and the British Crown assumed control in 1858. Sieges, Indian troops and supply shaped the campaign.',
      people: 'Frederick Sleigh Roberts · Colin Campbell · Bahadur Shah Zafar',
      sources: ['Frederick Sleigh Roberts, Forty-One Years in India (1897)'],
      connection: 'Roberts’s memoirs lead from Delhi and Lucknow to his later campaign in Afghanistan.',
      connectionId: 'second-afghan-war'
    }
  },
  {
    id: 'second-afghan-war', start: 1878, end: 1880,
    evidence: { label: 'National Army Museum', url: 'https://www.nam.ac.uk/explore/second-afghan-war' },
    de: {
      region: 'Afghanistan · Kabul und Kandahar', title: 'Zweiter Afghanischer Krieg',
      account: 'Die britisch-russische Rivalität um Einfluss in Afghanistan prägte den Feldzug. Frederick Sleigh Roberts führte 1880 eine Marschkolonne von Kabul nach Kandahar und siegte dort über die Streitkräfte Ayub Khans. Der Marsch verband große Reichweite mit der fortdauernden Abhängigkeit von Vorräten, Wegen und Pässen.',
      people: 'Frederick Sleigh Roberts · Scher Ali Khan · Ayub Khan',
      sources: ['Frederick Sleigh Roberts, Forty-One Years in India (1897)'],
      connection: 'Der Feldzug gehört zur längeren Rivalität um Zentralasien, die schon den Krieg von 1839–1842 überschattet hatte.',
      connectionId: 'first-afghan-war'
    },
    en: {
      region: 'Afghanistan · Kabul and Kandahar', title: 'Second Anglo-Afghan War',
      account: 'British–Russian rivalry over influence in Afghanistan shaped the campaign. In 1880 Frederick Sleigh Roberts led a marching column from Kabul to Kandahar and defeated Ayub Khan’s forces there. The march joined speed and distance to a continuing dependence on supplies, roads and passes.',
      people: 'Frederick Sleigh Roberts · Sher Ali Khan · Ayub Khan',
      sources: ['Frederick Sleigh Roberts, Forty-One Years in India (1897)'],
      connection: 'The campaign belonged to the longer contest over Central Asia that had already overshadowed the war of 1839–1842.',
      connectionId: 'first-afghan-war'
    }
  },
  {
    id: 'mahdist-sudan', start: 1881, end: 1899,
    evidence: { label: 'National Army Museum', url: 'https://www.nam.ac.uk/explore/egypt-and-sudan' },
    de: {
      region: 'Sudan · Khartum, Nil und Omdurman', title: 'Mahdistischer Aufstand und Rückeroberung des Sudan',
      account: 'Der mahdistische Aufstand begann 1881; Khartum fiel 1885 nach langer Belagerung, und Charles Gordon kam ums Leben. Kitcheners späteren Vormarsch trugen Eisenbahn und Niltransporte. Bei Omdurman wurde 1898 die Hauptmacht des Khalifen geschlagen; die letzten größeren Kämpfe folgten 1899.',
      people: 'Charles Gordon · Charles William Wilson · Herbert Kitchener · Abdallahi ibn Muhammad',
      sources: ['Charles William Wilson, From Korti to Khartum (1885) — Augenzeuge des Entsatzversuchs', 'George Arthur, Life of Lord Kitchener (1920) — zeitgenössische Biografie zum späteren Feldzug'],
      connection: 'Kitchener führte später britische Truppen im Zweiten Burenkrieg; beide Feldzüge verlangten weitreichende Transport- und Sicherungssysteme.',
      connectionId: 'second-boer-war'
    },
    en: {
      region: 'Sudan · Khartoum, the Nile and Omdurman', title: 'Mahdist War and the reconquest of Sudan',
      account: 'The Mahdist uprising began in 1881; Khartoum fell after a long siege in 1885, and Charles Gordon was killed. Railway construction and Nile transport sustained Kitchener’s later advance. The Khalifa’s main army was defeated at Omdurman in 1898; the last major fighting followed in 1899.',
      people: 'Charles Gordon · Charles William Wilson · Herbert Kitchener · Abdallahi ibn Muhammad',
      sources: ['Charles William Wilson, From Korti to Khartum (1885) — eyewitness account of the relief expedition', 'George Arthur, Life of Lord Kitchener (1920) — contemporary biography covering the later campaign'],
      connection: 'Kitchener later commanded British forces in the Second Boer War; both campaigns depended on extensive transport and security systems.',
      connectionId: 'second-boer-war'
    }
  },
  {
    id: 'asante-expedition', start: 1895, end: 1896,
    evidence: { label: 'British Museum', url: 'https://www.britishmuseum.org/about-us/british-museum-story/contested-objects-collection/asante-gold-regalia' },
    de: {
      region: 'Westafrika · Asante und Kumasi', title: 'Asante-Expedition gegen Prempeh',
      account: 'Der britische Feldzug führte 1895–1896 nach Kumasi; Asantehene Prempeh I. wurde festgesetzt und ins Exil gebracht. Im Wald bestimmten erkundete Wege, Pionierarbeiten, Träger und Versorgung das Tempo des Vormarschs. Baden-Powells Bericht hält die Arbeit eines beteiligten Offiziers fest.',
      people: 'Robert Baden-Powell · Prempeh I. · Francis Scott',
      sources: ['Robert Baden-Powell, The Downfall of Prempeh (1896)'],
      connection: 'Baden-Powell trat wenige Jahre später bei der Verteidigung Mafekings erneut hervor.',
      connectionId: 'second-boer-war'
    },
    en: {
      region: 'West Africa · Asante and Kumasi', title: 'Asante expedition against Prempeh',
      account: 'The British expedition advanced to Kumasi in 1895–1896; Asantehene Prempeh I was detained and exiled. In forest country, reconnoitred routes, engineering work, carriers and supply set the pace of the advance. Baden-Powell’s book records the work of an officer who took part.',
      people: 'Robert Baden-Powell · Prempeh I · Francis Scott',
      sources: ['Robert Baden-Powell, The Downfall of Prempeh (1896)'],
      connection: 'Baden-Powell came to wider notice a few years later during the defence of Mafeking.',
      connectionId: 'second-boer-war'
    }
  },
  {
    id: 'second-boer-war', start: 1899, end: 1902,
    evidence: { label: 'National Army Museum', url: 'https://www.nam.ac.uk/explore/boer-war' },
    de: {
      region: 'Südafrika · Mafeking und die Burenrepubliken', title: 'Zweiter Burenkrieg',
      account: 'Die Belagerung Mafekings von 1899 bis 1900 machte Baden-Powell bekannt. Nach den großen Feldschlachten ging der Krieg in bewegliche Operationen über; unter Kitchener stützte sich die britische Führung auf Eisenbahnen, Blockhauslinien und großflächige Sicherung. Die Einnahme einzelner Städte entschied diese spätere Kriegsphase nicht.',
      people: 'Robert Baden-Powell · Herbert Kitchener · Louis Botha',
      sources: ['Robert Baden-Powell, Scouting for Boys (1908) — Rückblicke auf Mafeking', 'George Arthur, Life of Lord Kitchener (1920) — zeitgenössische Biografie'],
      connection: 'Baden-Powell verbindet Asante mit Mafeking; Kitchener verbindet den Sudan mit Südafrika.',
      connectionId: 'mahdist-sudan'
    },
    en: {
      region: 'South Africa · Mafeking and the Boer republics', title: 'Second Boer War',
      account: 'The siege of Mafeking from 1899 to 1900 brought Baden-Powell to public attention. After the large set-piece battles, the war shifted to mobile operations; under Kitchener, British strategy relied on railways, blockhouse lines and control of extensive territory. Taking towns alone could not end this later phase.',
      people: 'Robert Baden-Powell · Herbert Kitchener · Louis Botha',
      sources: ['Robert Baden-Powell, Scouting for Boys (1908) — recollections of Mafeking', 'George Arthur, Life of Lord Kitchener (1920) — contemporary biography'],
      connection: 'Baden-Powell links Asante with Mafeking; Kitchener links Sudan with South Africa.',
      connectionId: 'mahdist-sudan'
    }
  },
  {
    id: 'mesopotamia', start: 1914, end: 1918,
    evidence: { label: 'National Army Museum', url: 'https://www.nam.ac.uk/explore/mesopotamia-campaign' },
    de: {
      region: 'Mesopotamien · Tigris und Kut al-Amara', title: 'Mesopotamien-Feldzug',
      account: 'Der britisch-indische Vormarsch am Tigris führte 1915 bis vor Bagdad, wurde bei Ktesiphon aufgehalten und wich nach Kut al-Amara zurück. Dort war Townshends Truppe von Dezember 1915 bis April 1916 eingeschlossen und kapitulierte nach gescheiterten Entsatzversuchen. Das Debakel machte die Grenzen von Transport, Versorgung und Sanitätswesen auf einem langen Vormarsch sichtbar.',
      people: 'Charles Vere Ferrers Townshend · John Nixon · Halil Pascha',
      sources: ['Charles Vere Ferrers Townshend, My Campaign in Mesopotamia (1920)'],
      connection: 'Wie frühere Feldzüge der britisch-indischen Armee hing auch dieser von Entfernung und belastbaren Verbindungslinien ab.',
      connectionId: 'first-afghan-war'
    },
    en: {
      region: 'Mesopotamia · the Tigris and Kut al-Amara', title: 'Mesopotamian campaign',
      account: 'The British Indian advance along the Tigris reached the approaches to Baghdad in 1915, was checked at Ctesiphon, and fell back to Kut al-Amara. Townshend’s force was besieged there from December 1915 to April 1916 and surrendered after relief attempts failed. The defeat exposed the limits of transport, supply and medical provision on a long advance.',
      people: 'Charles Vere Ferrers Townshend · John Nixon · Halil Pasha',
      sources: ['Charles Vere Ferrers Townshend, My Campaign in Mesopotamia (1920)'],
      connection: 'Like earlier campaigns of the British Indian Army, this one depended on distance and dependable lines of communication.',
      connectionId: 'first-afghan-war'
    }
  }
];

function create(lang) {
  if (!['de', 'en'].includes(lang)) throw new Error(`Unsupported chronology language: ${lang}`);
  return entries.map(({de, en, ...common}) => ({...common, ...(lang === 'de' ? de : en)}));
}

module.exports = {create, entries};
