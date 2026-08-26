// Travel phrasebook — essential phrases for common travel situations.
// Each language has a native name + a set of key phrases.

export const PHRASES = [
  { key: 'hello', label: 'Hello' },
  { key: 'thanks', label: 'Thank you' },
  { key: 'howmuch', label: 'How much?' },
  { key: 'bathroom', label: 'Where is the bathroom?' },
  { key: 'help', label: 'Help!' },
  { key: 'excuse', label: 'Excuse me' },
  { key: 'where', label: 'Where is...?' },
];

export const LANGUAGES = [
  {
    key: 'french', native: 'Français', langCode: 'fr-FR', flag: '🇫🇷',
    phrases: {
      hello: 'Bonjour', thanks: 'Merci', howmuch: 'Combien ?',
      bathroom: 'Où sont les toilettes ?', help: 'Au secours !',
      excuse: 'Excusez-moi', where: 'Où est… ?',
    },
  },
  {
    key: 'spanish', native: 'Español', langCode: 'es-ES', flag: '🇪🇸',
    phrases: {
      hello: 'Hola', thanks: 'Gracias', howmuch: '¿Cuánto cuesta?',
      bathroom: '¿Dónde está el baño?', help: '¡Ayuda!',
      excuse: 'Disculpe', where: '¿Dónde está…?',
    },
  },
  {
    key: 'japanese', native: '日本語', langCode: 'ja-JP', flag: '🇯🇵',
    phrases: {
      hello: 'こんにちは', thanks: 'ありがとう', howmuch: 'いくらですか？',
      bathroom: 'トイレはどこですか？', help: '助けて！',
      excuse: 'すみません', where: '…はどこですか？',
    },
  },
  {
    key: 'chinese', native: '中文', langCode: 'zh-CN', flag: '🇨🇳',
    phrases: {
      hello: '你好', thanks: '谢谢', howmuch: '多少钱？',
      bathroom: '洗手间在哪里？', help: '救命！',
      excuse: '打扰一下', where: '…在哪里？',
    },
  },
  {
    key: 'hindi', native: 'हिन्दी', langCode: 'hi-IN', flag: '🇮🇳',
    phrases: {
      hello: 'नमस्ते', thanks: 'धन्यवाद', howmuch: 'कितने का है?',
      bathroom: 'शौचालय कहाँ है?', help: 'मदद करो!',
      excuse: 'माफ़ कीजिए', where: '…कहाँ है?',
    },
  },
  {
    key: 'german', native: 'Deutsch', langCode: 'de-DE', flag: '🇩🇪',
    phrases: {
      hello: 'Hallo', thanks: 'Danke', howmuch: 'Wie viel?',
      bathroom: 'Wo ist die Toilette?', help: 'Hilfe!',
      excuse: 'Entschuldigung', where: 'Wo ist…?',
    },
  },
  {
    key: 'italian', native: 'Italiano', langCode: 'it-IT', flag: '🇮🇹',
    phrases: {
      hello: 'Ciao', thanks: 'Grazie', howmuch: 'Quanto costa?',
      bathroom: 'Dov\'è il bagno?', help: 'Aiuto!',
      excuse: 'Scusi', where: 'Dov\'è…?',
    },
  },
  {
    key: 'russian', native: 'Русский', langCode: 'ru-RU', flag: '🇷🇺',
    phrases: {
      hello: 'Здравствуйте', thanks: 'Спасибо', howmuch: 'Сколько стоит?',
      bathroom: 'Где туалет?', help: 'Помогите!',
      excuse: 'Извините', where: 'Где…?',
    },
  },
  {
    key: 'arabic', native: 'العربية', langCode: 'ar-SA', flag: '🇸🇦',
    phrases: {
      hello: 'مرحبا', thanks: 'شكرا', howmuch: 'كم الثمن؟',
      bathroom: 'أين الحمام؟', help: 'النجدة!',
      excuse: 'عفوا', where: 'أين…؟',
    },
  },
];
