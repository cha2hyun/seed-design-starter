/**
 * SEED validates `layout="iconOnly"` at runtime via IconRequired: the child must be
 * `<Icon svg={...} />`, not a raw SVG (e.g. lucide-react). Catch that at lint time.
 *
 * @type {import("eslint").Rule.RuleModule}
 */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        'Require a SEED <Icon /> child when a component uses layout="iconOnly" (matches SEED IconRequired).',
    },
    schema: [],
    messages: {
      missingIcon:
        'layout="iconOnly" requires a child <Icon svg={...} /> from `@/shared/ui` (or `@seed-design/react` in shared). Raw SVG icons throw at runtime.',
    },
  },

  create(context) {
    return {
      JSXElement(node) {
        if (!hasLayoutIconOnly(node.openingElement)) return;
        if (hasIconChild(node)) return;
        context.report({ node: node.openingElement, messageId: "missingIcon" });
      },
    };
  },
};

/**
 * @param {import("estree-jsx").JSXOpeningElement} opening
 */
function hasLayoutIconOnly(opening) {
  return opening.attributes.some((attr) => {
    if (attr.type !== "JSXAttribute") return false;
    if (attr.name.type !== "JSXIdentifier" || attr.name.name !== "layout") return false;
    return isIconOnlyValue(attr.value);
  });
}

/**
 * @param {import("estree-jsx").JSXAttribute["value"]} value
 */
function isIconOnlyValue(value) {
  if (!value) return false;
  if (value.type === "Literal") return value.value === "iconOnly";
  if (value.type === "JSXExpressionContainer") {
    const expr = value.expression;
    return expr.type === "Literal" && expr.value === "iconOnly";
  }
  return false;
}

/**
 * @param {import("estree-jsx").JSXElement} element
 */
function hasIconChild(element) {
  return element.children.some((child) => {
    if (child.type !== "JSXElement") return false;
    const name = child.openingElement.name;
    return name.type === "JSXIdentifier" && name.name === "Icon";
  });
}
