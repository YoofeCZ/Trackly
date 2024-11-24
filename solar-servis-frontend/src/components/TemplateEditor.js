import React from 'react';
import Editor from '@react-page/editor';
import slate from '@react-page/plugins-slate'; // Textový plugin
import image from '@react-page/plugins-image'; // Plugin pro obrázky

// Aktivní pluginy
const cellPlugins = [slate(), image()];

const TemplateEditor = ({ initialContent, onSave }) => {
  return (
    <div>
      <Editor
        cellPlugins={cellPlugins}
        value={initialContent} // Výchozí obsah
        onChange={onSave} // Uložení při změnách
      />
      <button
        onClick={() => onSave()}
        style={{ marginTop: '10px', padding: '10px', backgroundColor: 'blue', color: 'white' }}
      >
        Uložit šablonu
      </button>
    </div>
  );
};

export default TemplateEditor;
