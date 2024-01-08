import { CODE_BUILDER } from '@/components/UI/libraryPanel/nodes/nodeTypes';
import { ModalContext } from '@/contexts/ModalContext';
import { toPng } from 'html-to-image';
import React from 'react';
import { getRectOfNodes, getTransformForBounds, useReactFlow } from 'reactflow';

import { ContextMenuItemType } from '@/commons/types';
import ContextMenuModal from '@/components/modals/ContextMenuModal';
import ToastMessageModal from '@/components/modals/ToastMessageModal';

type MenuItemProps = React.HTMLProps<HTMLDivElement> & {
  name: string;
};
const MenuItem: React.FC<MenuItemProps> = (props: MenuItemProps) => {
  const { name } = props;
  return (
    <div {...props}>
      <div className="bg-gray-100 border border-gray-300 rounded skew-x-12 cursor-pointer hover:bg-gray-200 hover:border-gray-400">
        <p className="-skew-x-12 pr-8 pl-2 text-gray-700 font-medium text-sm">{name}</p>
      </div>
    </div>
  );
};

type Props = {
  onSaveGraph: () => boolean;
  onNewGraph: () => boolean;
  onRestore: () => void;
};

const imageWidth = 1024;
const imageHeight = 768;

const TopBar: React.FC<Props> = ({ onSaveGraph, onNewGraph, onRestore }: Props) => {
  const { setModal, setPoints } = React.useContext(ModalContext);
  const { getNodes, getEdges } = useReactFlow();

  const onClickExportAsPython = () => {
    const element = document.createElement('a');
    const file = new Blob([CODE_BUILDER(getNodes(), getEdges())], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);
    element.download = 'my x-force workflow.py';
    document.body.appendChild(element);
    element.click();
  };
  const onClickExportAsPNG = async () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(nodesBounds, imageWidth, imageHeight, 0.5, 2);
    const viewport = document.querySelector('.react-flow__viewport');
    if (!viewport) return null;
    const png = await toPng(viewport as HTMLElement, {
      backgroundColor: '#fff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: '1024',
        height: '768',
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    });
    const a = document.createElement('a');
    a.setAttribute('download', 'my x-force workflow.png');
    a.setAttribute('href', png);
    a.click();
  };

  const onSave = () => {
    const res = onSaveGraph();
    if (res) {
      setModal(<ToastMessageModal msg="Changes saved." />);
      setPoints({ bottom: 44, right: 44 });
    }
  };
  const CTX_MENU__FILE: ContextMenuItemType[] = [
    { item: 'New', onClick: onNewGraph },
    { item: 'Save', onClick: onSave },
    { item: 'Restore previous graph...', onClick: onRestore },
    {
      item: 'Export As',
      subs: [
        { item: 'Python Code...', onClick: onClickExportAsPython },
        { item: 'PNG...', onClick: onClickExportAsPNG },
      ],
    },
  ];

  const onClickFile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    setModal(<ContextMenuModal menu={CTX_MENU__FILE} />);
    setPoints({ left: e.pageX, top: e.pageY });
  };
  return (
    <div className={`absolute top-0 w-[calc(100vw-320px)] bg-gray-50 h-11 border-b border-b-gray-200 z-10 opacity-95`}>
      <div className="flex h-11 items-center px-4 justify-between">
        <div>
          <MenuItem name="File" onClick={onClickFile} />
        </div>
        <div className="flex">
          <MenuItem name="About" />
          <MenuItem name="Mission" className="ml-2" />
          <MenuItem name="Contribute" className="ml-2" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
