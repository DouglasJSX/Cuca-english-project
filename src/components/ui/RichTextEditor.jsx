'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Node, mergeAttributes } from '@tiptap/core';
import { useCallback, useEffect, useState } from 'react';
import { useToast } from './Toast';

// Extensão customizada para checkbox inline
const InlineCheckbox = Node.create({
  name: 'inlineCheckbox',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (element) =>
          element.querySelector('input')?.checked || false,
        renderHTML: (attributes) => {
          return attributes.checked ? { checked: 'checked' } : {};
        },
      },
      id: {
        default: null,
        parseHTML: (element) => element.querySelector('input')?.id || null,
        renderHTML: (attributes) => {
          return { id: attributes.id };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.inline-checkbox',
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const checkboxId =
      node.attrs.id ||
      `checkbox-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return [
      'span',
      mergeAttributes(HTMLAttributes, { class: 'inline-checkbox' }),
      [
        'input',
        {
          type: 'checkbox',
          id: checkboxId,
          checked: node.attrs.checked ? 'checked' : null,
        },
      ],
    ];
  },

  addCommands() {
    return {
      insertCheckbox:
        () =>
        ({ commands }) => {
          const checkboxId = `checkbox-${Date.now()}-${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          return commands.insertContent({
            type: this.name,
            attrs: {
              checked: false,
              id: checkboxId,
            },
          });
        },
      toggleCheckbox:
        (id) =>
        ({ tr, state }) => {
          let nodeFound = false;
          const newTr = tr;
          
          state.doc.descendants((node, pos) => {
            if (node.type.name === this.name && node.attrs.id === id) {
              const newAttrs = {
                ...node.attrs,
                checked: !node.attrs.checked,
              };
              newTr.setNodeMarkup(pos, undefined, newAttrs);
              nodeFound = true;
              return false;
            }
          });
          
          return nodeFound;
        },
    };
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('span');
      dom.className = 'inline-checkbox';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = node.attrs.id;
      checkbox.checked = node.attrs.checked;
      
      checkbox.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof getPos === 'function') {
          editor.commands.toggleCheckbox(node.attrs.id);
        }
      });
      
      dom.appendChild(checkbox);
      return { dom };
    };
  },
});

const RichTextEditor = ({
  content,
  onChange,
  placeholder = 'Start writing...',
  onSave,
}) => {
  const { toast } = useToast();
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const [currentStates, setCurrentStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    h1: false,
    h2: false,
    h3: false,
    bulletList: false,
    orderedList: false,
    link: false,
    textAlign: 'left',
    textColor: '#000000',
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      InlineCheckbox,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const currentContent = editor.getHTML();
      onChange?.(currentContent);
      // Delay para garantir que o estado seja atualizado
      setTimeout(() => updateCurrentStates(editor), 0);
    },
    onSelectionUpdate: ({ editor }) => {
      setTimeout(() => updateCurrentStates(editor), 0);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[300px] p-4',
      },
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    immediatelyRender: false,
  });

  const updateCurrentStates = useCallback((editor) => {
    if (!editor) return;

    // Método mais robusto para detectar a cor atual
    let currentColor = '#000000';

    try {
      // Primeiro tenta pegar da textStyle
      const textStyleColor = editor.getAttributes('textStyle').color;
      if (textStyleColor) {
        currentColor = textStyleColor;
      } else {
        // Se não encontrou, verifica se há cor inline no elemento atual
        const { selection } = editor.state;
        const { from, to } = selection;

        // Se há seleção, verifica a cor do texto selecionado
        if (from !== to) {
          editor.state.doc.nodesBetween(from, to, (node, pos) => {
            if (node.marks) {
              node.marks.forEach((mark) => {
                if (mark.type.name === 'textStyle' && mark.attrs.color) {
                  currentColor = mark.attrs.color;
                }
              });
            }
          });
        } else {
          // Se não há seleção, verifica as marcas ativas na posição do cursor
          const marks =
            editor.state.storedMarks || editor.state.selection.$from.marks();
          marks.forEach((mark) => {
            if (mark.type.name === 'textStyle' && mark.attrs.color) {
              currentColor = mark.attrs.color;
            }
          });
        }
      }
    } catch (error) {
      // Fallback para cor padrão se houver erro
      currentColor = '#000000';
    }

    setCurrentStates({
      bold: editor.isActive('bold'),
      italic: editor.isActive('italic'),
      underline: editor.isActive('underline'),
      h1: editor.isActive('heading', { level: 1 }),
      h2: editor.isActive('heading', { level: 2 }),
      h3: editor.isActive('heading', { level: 3 }),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      link: editor.isActive('link'),
      textAlign: editor.isActive({ textAlign: 'center' })
        ? 'center'
        : editor.isActive({ textAlign: 'right' })
        ? 'right'
        : 'left',
      textColor: currentColor,
    });
  }, []);

  useEffect(() => {
    if (editor) {
      // Força atualização inicial após editor estar pronto
      setTimeout(() => updateCurrentStates(editor), 100);
    }
  }, [editor, updateCurrentStates]);

  const handleSave = useCallback(() => {
    if (onSave && editor) {
      const currentContent = editor.getHTML();
      onSave(currentContent);
    }
  }, [onSave, editor]);

  const openLinkModal = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );

    setLinkUrl(previousUrl || '');
    setLinkText(selectedText || '');
    setShowLinkModal(true);
  }, [editor]);

  const handleLinkSubmit = useCallback(() => {
    if (!linkUrl.trim()) {
      toast.error('Por favor, insira uma URL válida');
      return;
    }

    // Se há texto selecionado, apenas adiciona o link
    if (editor.state.selection.from !== editor.state.selection.to) {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    // Se não há texto selecionado, insere o texto e adiciona o link
    else if (linkText.trim()) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkText}</a>`)
        .run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${linkUrl}">${linkUrl}</a>`)
        .run();
    }

    toast.success('Link adicionado com sucesso!');
    setShowLinkModal(false);
    setLinkUrl('');
    setLinkText('');
  }, [editor, linkUrl, linkText, toast]);

  const handleRemoveLink = useCallback(() => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    toast.info('Link removido');
    setShowLinkModal(false);
  }, [editor, toast]);

  const insertCheckbox = useCallback(() => {
    editor.chain().focus().insertCheckbox().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const MenuButton = ({ onClick, isActive, children, title }) => (
    <button
      onClick={onClick}
      type="button"
      className={`p-2 rounded hover:bg-gray-200 transition-colors ${
        isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg bg-white relative">
      <style jsx global>{`
        .rich-text-content .ProseMirror {
          outline: none !important;
          padding: 1rem;
          min-height: 300px;
          font-family: inherit;
        }

        .rich-text-content .ProseMirror a {
          color: #2563eb !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }

        .rich-text-content .ProseMirror a:hover {
          color: #1d4ed8 !important;
        }

        .rich-text-content .ProseMirror h1 {
          font-size: 2rem !important;
          line-height: 1.2 !important;
          font-weight: 700 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 1rem !important;
        }

        .rich-text-content .ProseMirror h2 {
          font-size: 1.5rem !important;
          line-height: 1.3 !important;
          font-weight: 600 !important;
          margin-top: 1.25rem !important;
          margin-bottom: 0.75rem !important;
        }

        .rich-text-content .ProseMirror h3 {
          font-size: 1.25rem !important;
          line-height: 1.4 !important;
          font-weight: 600 !important;
          margin-top: 1rem !important;
          margin-bottom: 0.5rem !important;
        }

        .rich-text-content .ProseMirror ul {
          margin: 1rem 0 !important;
          padding-left: 1.5rem !important;
          list-style: none !important;
        }

        .rich-text-content .ProseMirror ol {
          margin: 1rem 0 !important;
          padding-left: 1.5rem !important;
          list-style: none !important;
        }

        .rich-text-content .ProseMirror ul li {
          margin: 0.5rem 0 !important;
          line-height: 1.6 !important;
          position: relative !important;
        }

        .rich-text-content .ProseMirror ul li::before {
          content: '•' !important;
          color: #374151 !important;
          font-weight: bold !important;
          position: absolute !important;
          left: -1rem !important;
        }

        .rich-text-content .ProseMirror ol li {
          margin: 0.5rem 0 !important;
          line-height: 1.6 !important;
          position: relative !important;
          counter-increment: list-counter !important;
        }

        .rich-text-content .ProseMirror ol {
          counter-reset: list-counter !important;
        }

        .rich-text-content .ProseMirror ol li::before {
          content: counter(list-counter) '.' !important;
          color: #374151 !important;
          font-weight: bold !important;
          position: absolute !important;
          left: -1.5rem !important;
        }

        .rich-text-content .ProseMirror p {
          margin: 0.75rem 0 !important;
          line-height: 1.6 !important;
        }

        .rich-text-content .ProseMirror > *:first-child {
          margin-top: 0 !important;
        }

        .rich-text-content .ProseMirror .inline-checkbox {
          display: inline-block !important;
          margin-left: 8px !important;
          cursor: pointer !important;
          user-select: none !important;
        }

        .rich-text-content
          .ProseMirror
          .inline-checkbox
          input[type='checkbox'] {
          appearance: none !important;
          width: 16px !important;
          height: 16px !important;
          border: 2px solid #d1d5db !important;
          border-radius: 3px !important;
          background: white !important;
          cursor: pointer !important;
          position: relative !important;
          margin: 0 !important;
          outline: none !important;
          transition: all 0.2s ease !important;
          vertical-align: middle !important;
        }

        .rich-text-content
          .ProseMirror
          .inline-checkbox
          input[type='checkbox']:hover {
          border-color: #9ca3af !important;
          background-color: #f9fafb !important;
        }

        .rich-text-content
          .ProseMirror
          .inline-checkbox
          input[type='checkbox']:checked {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .rich-text-content
          .ProseMirror
          .inline-checkbox
          input[type='checkbox']:checked::after {
          content: '✓' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          color: white !important;
          font-size: 10px !important;
          font-weight: bold !important;
          line-height: 1 !important;
        }
      `}</style>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex flex-wrap gap-1">
        {/* Text Style */}
        <div className="flex items-center space-x-1 mr-3">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={currentStates.bold}
            title="Bold"
          >
            <strong>B</strong>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={currentStates.italic}
            title="Italic"
          >
            <em>I</em>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleUnderline?.().run()}
            isActive={currentStates.underline}
            title="Underline"
          >
            <u>U</u>
          </MenuButton>
        </div>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Headings */}
        <div className="flex items-center space-x-1 mr-3">
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={currentStates.h1}
            title="Heading 1"
          >
            H1
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={currentStates.h2}
            title="Heading 2"
          >
            H2
          </MenuButton>
          <MenuButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={currentStates.h3}
            title="Heading 3"
          >
            H3
          </MenuButton>
        </div>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Lists */}
        <div className="flex items-center space-x-1 mr-3">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={currentStates.bulletList}
            title="Bullet List"
          >
            •
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={currentStates.orderedList}
            title="Numbered List"
          >
            1.
          </MenuButton>
          <MenuButton
            onClick={insertCheckbox}
            isActive={false}
            title="Checkbox"
          >
            ☑
          </MenuButton>
        </div>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Alignment */}
        <div className="flex items-center space-x-1 mr-3">
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={currentStates.textAlign === 'left'}
            title="Align Left"
          >
            ⬅
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={currentStates.textAlign === 'center'}
            title="Align Center"
          >
            ↔
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={currentStates.textAlign === 'right'}
            title="Align Right"
          >
            ➡
          </MenuButton>
        </div>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Link */}
        <div className="flex items-center space-x-1 mr-3">
          <MenuButton
            onClick={openLinkModal}
            isActive={currentStates.link}
            title="Add Link"
          >
            🔗
          </MenuButton>
        </div>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Colors */}
        <div className="flex items-center space-x-1 mr-3">
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            value={currentStates.textColor}
            className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            title="Text Color"
          />
        </div>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Clear */}
        <MenuButton
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
          title="Clear Formatting"
        >
          🗑️
        </MenuButton>

        <div className="border-l border-gray-300 mx-2"></div>

        {/* Save */}
        {onSave && (
          <MenuButton onClick={handleSave} title="Salvar">
            💾
          </MenuButton>
        )}
      </div>

      {/* Editor Content */}
      <div className="min-h-[300px] relative">
        <EditorContent editor={editor} className="rich-text-content" />
        {/* Placeholder when empty */}
        {editor.isEmpty && (
          <div className="absolute top-4 left-4 text-gray-400 pointer-events-none text-sm">
            {placeholder}
          </div>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowLinkModal(false)}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentStates.link ? 'Editar Link' : 'Adicionar Link'}
              </h3>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL do Link *
                </label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {editor.state.selection.from === editor.state.selection.to && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texto do Link
                  </label>
                  <input
                    type="text"
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    placeholder="Texto que será exibido"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div>
                {currentStates.link && (
                  <button
                    onClick={handleRemoveLink}
                    className="px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Remover Link
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLinkSubmit}
                  disabled={!linkUrl.trim()}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {currentStates.link ? 'Atualizar' : 'Adicionar'} Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;
