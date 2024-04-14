function textDownload(name: string,...text: any[]) {
  const blob = new Blob(text, { type: 'text/plain' });
      // 创建一个 a 标签
      const a = document.createElement('a');
      // 设置下载的文件名
      a.download = name + '.txt';
      // 将 blob 对象转换为链接地址
      a.href = URL.createObjectURL(blob);
      // 点击链接，下载文件
      a.click();
}

function findRootNodeWithElement(element: { getAttribute: (arg0: any) => any; parentElement: any; } | null, targetTagName: string) {
  // 从当前元素开始向上遍历DOM树
  if (element !== null && element.getAttribute(targetTagName)) {
    return element.getAttribute(targetTagName);
  } else if (element?.parentElement) {
    // 如果找到包含目标元素的根节点，则返回该根节点；否则返回null
    return findRootNodeWithElement(element.parentElement, targetTagName);
  }
  return null
}

export {textDownload,findRootNodeWithElement}