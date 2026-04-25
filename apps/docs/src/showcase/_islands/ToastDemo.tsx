// Wave 7 P5 + Wave 9 P2.9 — Toast showcase island.
//
// Wave 7 shipped this as a static gallery of all 4 variants
// (`dismissible={false}`) — purely visual reference. Wave 9 promotes
// the demo to a stateful interactive surface so the dismiss contract
// is part of the documented behaviour: a "Trigger toast" button shows
// a dismissible success toast; the close `×` removes it from the DOM.
// The 3 remaining gallery rows stay underneath as the visual
// reference of the other variants.
import { useState } from 'react';
import { Toast, Button } from '@freecodecamp/uikit';

export function ToastDemo(): JSX.Element {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12, maxWidth: 420, margin: '0 auto' }}>
      <Button onClick={() => setVisible(true)}>Trigger toast</Button>
      {visible && (
        <Toast
          variant='success'
          title='Saved'
          description='Your code passed all tests.'
          onDismiss={() => setVisible(false)}
        />
      )}
      <Toast
        variant='warning'
        title='Heads up'
        description='Two failing tests since last run.'
        dismissible={false}
      />
      <Toast
        variant='danger'
        title='Build broken'
        description='Linter rejected your last commit.'
        dismissible={false}
      />
      <Toast
        variant='info'
        title='New cert available'
        description='Backend Development is now public.'
        dismissible={false}
      />
    </div>
  );
}

export default ToastDemo;
