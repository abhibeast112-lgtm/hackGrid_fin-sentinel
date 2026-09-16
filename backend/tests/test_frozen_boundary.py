import ast
import pathlib
import unittest


class TestFrozenBoundary(unittest.TestCase):
    """Ensures Fin-Sentinel maintains strict boundary isolation.

    Zero imports of:
    - api
    - database
    - engine
    """

    FORBIDDEN_MODULES = {"api", "database", "engine"}

    def test_no_forbidden_imports(self):
        pkg_root = pathlib.Path(__file__).parent.parent
        py_files = list(pkg_root.rglob("*.py"))
        self.assertGreater(len(py_files), 5, "Should find multiple python source files in package")

        violations = []
        for py_file in py_files:
            rel_path = py_file.relative_to(pkg_root)
            source = py_file.read_text(encoding="utf-8")
            try:
                tree = ast.parse(source, filename=str(py_file))
            except SyntaxError as e:
                self.fail(f"Syntax error in {rel_path}: {e}")

            for node in ast.walk(tree):
                # Check: import api, import database, import engine
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        top_module = alias.name.split(".")[0].lower()
                        if top_module in self.FORBIDDEN_MODULES:
                            violations.append(f"{rel_path}:{node.lineno} forbidden import '{alias.name}'")

                # Check: from api import ..., from database import ..., from engine import ...
                elif isinstance(node, ast.ImportFrom):
                    if node.module:
                        top_module = node.module.split(".")[0].lower()
                        if top_module in self.FORBIDDEN_MODULES:
                            violations.append(f"{rel_path}:{node.lineno} forbidden from-import '{node.module}'")

        err_msg = "Found forbidden imports violating teammate boundary: " + ", ".join(violations)
        self.assertEqual(violations, [], err_msg)


if __name__ == "__main__":
    unittest.main()
