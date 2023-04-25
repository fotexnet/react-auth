import React from 'react';

interface IProps {}

function TemplateName(props: TemplateNameProps): JSX.Element {
  return <div>TemplateName component works!</div>;
}

export default TemplateName;

export type TemplateNameProps = React.PropsWithChildren<IProps>;
